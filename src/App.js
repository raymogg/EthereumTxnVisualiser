import React, { Component } from 'react';
import './App.css';
import CustomGraph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import NodeInfo from './components/NodeInfo'
import TransactionBacklog from './components/TransactionBacklog'
import LinkInfo from './components/LinkInfo'
import { createMuiTheme } from '@material-ui/core/styles';
import {
    fetchERC20Transactions,
    fetchERC20TransactionsIter,
    fetchTransactions,
    fetchTxnIterable,
} from "./services/api";
import {
    accountTransactionsToNodes,
    updateTransactions,
    containsLink,
    updateAccountLinks,
    updateAccountTransactions,
} from "./transactionHelpers";
import SimpleStream from "./stream";
import { SnackbarProvider } from 'notistack';


const mainContainerStyle = {
    height: "100vh",
    // marginTop: "5px",
    display: 'block',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: "#241e56",
    textAlign: "center",
    color: "white",
    position: 'relative'
};

const theme = createMuiTheme({
    palette: {
        primary: {
            // light: will be calculated from palette.primary.main,
            main: '#2c254f',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contrast with palette.primary.main
        },
        secondary: {
            main: '#e8e8ea',
            // dark: will be calculated from palette.secondary.main,
        },
    },
});

const emptyGraph = {
    nodes: [],
    links: []
}


class App extends Component {
    state = {
        /* object with all fetched transactions where key is transactions hash for O(1) lookup */
        transactions: {},
        /* cache of 'account addresses' to { from => Set {transaction hashes}, to => Set{transaction hashes} } */
        accountTxns: {},
        /* cache of links between accounts (determined by transactions between accounts) */
        accountLinks: {},

        /* Whether the graph has gone through the initial load yet */
        dataSet: false,
        /* object with 'nodes' and 'updateAccountLinks' properties */
        graph: emptyGraph,
        /* a bool that represents whether a new graph is being loaded */
        isLoading: false,
        //Bool representating whether edges should be scaled by transaction value (when true)
        //or by transaciont count (when false)
        scaleByTransactionValue: false,
        //Holder for the address first searched for - used when reseting the graph
        initialAddress: "",
        //Sets what network to pull the transactions from
        network: "mainnet",
        //Show a nice little error message if something goes wrong
        error: false,
        //What token does the user want to show transactions for (note this is the tokens contract address)
        tokenAddress: "0x0",
        //Holder for the direction of the graph
        directed: true,
        //currency holder which determines what currency the data is displayed in
        currency: "E",
        currencyStream: SimpleStream(),
        //Holder to check if the conversion rate has been retrieved
        currencyConversionRate: false,
        //Stream that sends the conversion rate
        currencyConversionStream: SimpleStream(),
        /* Whenever the user 'hovers' over a node, the node / account info should be
        * published to this stream. */
        mouseOverNodeStream: SimpleStream(),
        /* Whenever the user clicks a link, the link info should be published to this stream. */
        linkClickedStream: SimpleStream(),

        transactionBacklogs: {},

        backlogSize: 0,

        backlogDestroyStream: SimpleStream(),
        backlogCreatedStream: SimpleStream(),
        // loadBacklogNotificationStream: SimpleStream(),
    };

    componentDidMount() {
        this.state.backlogDestroyStream.sub(accountAddress => {
            console.log('removing backlog for:', accountAddress)
            this.state.transactionBacklogs[accountAddress] = undefined;
        })
    }

    onMouseOverNode = (accountAddress) => {
        const txns = this.state.accountTxns[accountAddress]
        // console.log(`Mouse over node: address = ${accountAddress}, transactions =`, txns)

        let grossFrom = 0
        for (const hash of txns.from) {
            // console.log('from txn hash:', hash)
            grossFrom += this.state.transactions[hash].value / Math.pow(10, 18)
        }

        let grossTo = 0
        for (const hash of txns.to) {
            // console.log('to txn hash:  ', hash)
            grossTo += this.state.transactions[hash].value / Math.pow(10, 18)
        }

        const node = {
            id: accountAddress,
            transactionsToCount: txns.to.size,
            transactionsFromCount: txns.from.size,
            netValue: grossTo - grossFrom,
            currency: 'E',
        }

        this.state.mouseOverNodeStream.pub(node)
        this.state.currencyStream.pub(this.state.currency)
    }

    searchHandler = async (address) => {
        //Reset the state first
        this.resetData();
        this.setState({ initialLoad: false });
        this.setState({ isLoading: true, initialAddress: address });
        this.fetchTransactionsThenUpdateGraph(address)
            .catch(err => console.log('App.searchHandler ERROR:', err))
    }


    resetData = (onComplete) => {
        this.setState({
            transactions: {},
            accountTxns: {},
            accountLinks: {},
            dataSet: false,
            graph: emptyGraph,
            isLoading: true,
            error: false
        }, onComplete)
    }

    onDirectionChange = (directed) => {
        console.log(`Updating graph direction feature: old directed = ${this.state.graph.directed}, new directed = ${directed}`)
        this.state.directed = directed
        this.setState(currentState => {
            const graph = Object.assign(currentState.graph, { directed })
            return { graph }
        })
    }

    onUpdateEdgeScaling = (newEdgeScaling) => {
        console.log("Updating Edge Scale Type in app")
        console.log(newEdgeScaling)
        //If no account has been searched for, change the setting but dont re pull graph data
        if (this.state.initialAddress === "") {
            if (newEdgeScaling === "Transaction Value") {
                this.setState({ scaleByTransactionValue: true })
            } else {
                this.setState({ scaleByTransactionValue: false })
            }
            return;
        }

        //Account has already been searched for - update scaling and re pull data
        if (newEdgeScaling === "Transaction Value") {
            this.setState({ scaleByTransactionValue: true }, () => {
                this.resetData(() => {
                    this.fetchTransactionsThenUpdateGraph(this.state.initialAddress)
                        .catch(err => console.log('onUpdateEdgeScaling ERROR', err))
                })
            })
        } else if (newEdgeScaling === "Transaction Count") {
            this.setState({ scaleByTransactionValue: false }, () => {
                this.resetData(() => {
                    this.fetchTransactionsThenUpdateGraph(this.state.initialAddress)
                        .catch(err => console.log('onUpdateEdgeScaling ERROR', err))
                })
            })
        }
    }

    onNetworkChange = (newNetwork) => {
        this.setState({ network: newNetwork },
            () => {
                if (this.state.initialAddress !== "") {
                    this.resetData(() => {
                        this.fetchTransactionsThenUpdateGraph(this.state.initialAddress)
                            .catch(err => console.log('onNetworkChange ERROR', err))
                    })
                }
            })
    }

    onCurrencyChange = (newCurrency) => {
        console.log(`Updating graph currency to ${newCurrency}`)
        this.state.currency = newCurrency
        //resend to the streams
        this.state.linkClickedStream.pub(false)
        this.state.mouseOverNodeStream.pub(false)
        this.state.currencyStream.pub(this.state.currency)
    }

    onTokenChange = (newToken) => {
        // Change currency to T for token
        this.state.currency = "T";
        this.state.currencyStream.pub(this.state.currency);
        if (newToken === "0x0") {
            // Change currency to Ethereum
            this.state.currency = "E";
            this.state.currencyStream.pub(this.state.currency);
        }
        //resend to the streams
        this.state.linkClickedStream.pub(false);
        this.state.mouseOverNodeStream.pub(false);
        this.setState({ tokenAddress: newToken },
            () => {
                if (this.state.initialAddress !== "") {
                    this.resetData(() => {
                        this.fetchTransactionsThenUpdateGraph(this.state.initialAddress)
                            .catch(err => console.log('onTokenChange ERROR', err))
                    })
                }
            })
    }

    onClickGraph = async () => {
        console.log("Aidan was here.")
    }

    onClickNode = async (accountAddress) => {
        this.setState({ isLoading: true });
        let transactionIter = await fetchTxnIterable(accountAddress, this.state.network)
        //This happens for genesis or mining transactions
        if (transactionIter.size() == 0) {
            return
        }
        if (transactionIter.size() > 10) {
            if (!this.state.transactionBacklogs[accountAddress]) {
                this.state.transactionBacklogs[accountAddress] = transactionIter

                const transactions = transactionIter.take(10)
                this.updateWithTransactions(transactions)

                this.state.backlogCreatedStream.pub(accountAddress)
                this.setState({ backlogSize: transactionIter.size() });
            }
        } else {
            const transactions = transactionIter.drain()
            this.updateWithTransactions(transactions)
        }
    }

    onMouseOverLink = async (source, target) => {
        const link = containsLink(this.state.accountLinks, { source, target })
        this.state.selectedLink = link
        this.state.linkClickedStream.pub(link)
        this.state.currencyStream.pub(this.state.currency)
    }

    fetchTransactionsThenUpdateGraph = async (accountAddress) => {
        // console.log('Fetching transactions for accountAddress:', accountAddress)
        //
        // // Check if we are getting transactions for Ether or for an ERC20 Token
        // const transactions = await (this.state.tokenAddress === '0x0'
        //     ? fetchTxnIterable(accountAddress, this.state.network)
        //     : fetchERC20TransactionsIter(accountAddress, this.state.tokenAddress))
        //
        // console.log('Transactions for account id:', transactions)
        //
        // // Put the initial search into the backlog
        // this.state.transactionBacklogs[accountAddress] = transactions;
        //
        // // This is just a catch if there is no transactions for this account, show this as a little something something
        // if (transactions.length === 0) {
        //     console.error('No transactions returned for account:', accountAddress)
        //     this.setState({ error: true, isLoading: false })
        //     return
        // }
        //
        // const transactions = transactionIter.drain()
        // this.updateWithTransactions(transactions)

        this.onClickNode(accountAddress);
    }


    /**
     * TODO: this should become the main update (state) function since it's used across several methods.
     */
    updateWithTransactions = (transactions) => {
        transactions = this.filterExistingTransactions(transactions)
        updateTransactions(this.state.transactions, transactions)
        updateAccountTransactions(this.state.accountTxns, transactions)
        const accountNodes = accountTransactionsToNodes(this.state.accountTxns)
        updateAccountLinks(this.state.accountLinks, transactions, this.state.scaleByTransactionValue)

        const graphData = {
            nodes: accountNodes,
            links: Object.values(this.state.accountLinks),
            directed: this.state.directed,
            currency: this.state.currency,
        }

        // This triggers update/re-render so changes reflected in graph sub-component
        this.setState({
            graph: graphData,
            dataSet: true,
            isLoading: false
        })
    }

    filterExistingTransactions = (transactions) => {
        console.log("Checking duplicates")

        //CHeck for duplicate transactions
        for (var txn in transactions) {
            for (var oldTxn in this.state.transactions) {
                if (this.state.transactions[oldTxn] == undefined || transactions[txn] == undefined) {
                    continue;
                }
                if (this.state.transactions[oldTxn].hash == transactions[txn].hash) {
                    console.log("match found")
                    console.log(this.state.transactions[oldTxn].hash)
                    console.log(transactions[txn].hash)
                    transactions[txn] = null
                }
            }
        }

        //Check if transactions is now empty -> if so do no further updates
        if (Object.entries(transactions).length === 0) {
            console.log("Transactions empty")
            return;
        }

        //Re filter to remove empty elements in the transactions
        var updatedTransactions = []
        for (var txn in transactions) {
            if (transactions[txn] === null) {
                continue;
            } else {
                updatedTransactions.push(transactions[txn])
            }
        }
        transactions = updatedTransactions
        return transactions;
    }

    loadTransactionBacklog = (address) => {
        let txnsIter = this.state.transactionBacklogs[address]
        if (!txnsIter) {
            console.warn('No backlog found for account:', address)
            return
        }
        let transactions = txnsIter.take(10)
        if (txnsIter.isDone()) {
            this.state.backlogDestroyStream.pub(address)
        }
        this.updateWithTransactions(transactions)
    }

    /**
    Function which fetches the conversion rate from an online source
    */
    getConversionRate = async () => {
        const rate = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=AUD").then(function (response) {
            return response.json()
        }).then(function (response) {
            return parseFloat(response.AUD)
        });
        this.state.currencyConversionStream.pub(rate)
        this.setState({ currencyConversionRate: true })
    };

    render() {
        if (this.state.dataSet) {
            document.querySelector(".selected-node").style.visibility = "visible";
            document.querySelector(".selected-link").style.visibility = "visible";
        };
        if (!this.state.currencyConversionRate) {
            this.getConversionRate();
        };

        return (
            <div className="App">
                <div className="mainContainer" style={mainContainerStyle}>

                    <div className="selected-container">
                        <NodeInfo nodes={this.state.mouseOverNodeStream}
                            currency={this.state.currencyStream}
                            currencyConversionRate={this.state.currencyConversionStream} />
                        <LinkInfo links={this.state.linkClickedStream}
                            currency={this.state.currencyStream}
                            currencyConversionRate={this.state.currencyConversionStream} />
                    </div>

                    <AddressEntry searchHandler={this.searchHandler}
                        onEdgeScaleChange={this.onUpdateEdgeScaling}
                        onNetworkChange={this.onNetworkChange}
                        onDirectionChange={this.onDirectionChange}
                        onTokenChange={this.onTokenChange}
                        onCurrencyChange={this.onCurrencyChange} />

                    <CustomGraph
                        graph={this.state.graph}
                        style={{ backgroundColor: "black" }}
                        dataSet={this.state.dataSet}
                        onClickGraph={this.onClickGraph}
                        onClickNode={this.onClickNode}
                        onHoverNode={this.onMouseOverNode}
                        onMouseOverLink={this.onMouseOverLink}
                        isLoading={this.state.isLoading}
                        error={this.state.error} />
                </div>

                <SnackbarProvider
                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
                    <TransactionBacklog
                        loadBacklogHandler={this.loadTransactionBacklog}
                        backlogDestroyStream={this.state.backlogDestroyStream}
                        backlogCreatedStream={this.state.backlogCreatedStream}
                    />
                </SnackbarProvider>
            </div>
        );
    }
}


export default App;

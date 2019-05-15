import React, {Component} from 'react';
import './App.css';
import CustomGraph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import AccountInfo from './components/AccountInfo'
import LinkInfo from './components/LinkInfo'
import {createMuiTheme} from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import {
    fetchERC20Transactions,
    fetchTransactions,
    fetchTxnIterable,
} from "./services/api";
import {
    accountTransactionsToNodes,
    updateTransactions,
    containsLink,
    toggleLabel, updateAccountLinks,
    updateAccountTransactions,
} from "./transactionHelpers";
import SimpleStream from "./stream";
import {Button} from "@material-ui/core";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import Snackbar from "@material-ui/core/es/Snackbar/Snackbar";

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

const noNodeSelected = {
    id: "Hover over node",
    transactionsToCount: 0,
    transactionsFromCount: 0,
    netValue: 0,
    currency: "E"
};


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

        /* empty node placeholder for the node details on hover */
        selectedNode: noNodeSelected,

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
        directed: false,

        /* Whenever the user 'hovers' over a node, the node / account info should be
        * published to this stream. */
        mouseOverNodeStream: SimpleStream(),
        /* Whenever the user clicks a link, the link info should be published to this stream. */
        linkClickedStream: SimpleStream(),

        transactionBacklogs: {},

        backlogSize: 0,
    };

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
    }

    searchHandler = async (address) => {
        //Reset the state first
        this.resetData();
        this.setState({initialLoad: false});
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
            selectedNode: noNodeSelected,
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

    onTokenChange = (newToken) => {
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
    }

    onClickNode = async (accountAddress) => {
        this.setState({ isLoading: true });
        // this.fetchTransactionsThenUpdateGraph(accountAddress)
        //     .catch(err => console.log('App.onClickNode ERROR:', err))

        console.log(`onClickNode: ${accountAddress}`)

        let transactionIter = await fetchTxnIterable(accountAddress, this.state.network)
        if (transactionIter.size() > 10) {
            this.state.transactionBacklogs[accountAddress] = transactionIter

            const transactions = transactionIter.take(10)
            this.updateWithTransactions(transactions)

            this.setState({backlogSize: transactionIter.size()});

        } else {
            const transactions = transactionIter.drain()
            this.updateWithTransactions(transactions)
        }
    }

    onMouseOverLink = async (source, target) => {
        const link = containsLink(this.state.accountLinks, {source, target})
        //toggleLabel(link, `#trans: ${link.occurrences}`)

        this.state.linkClickedStream.pub(link)
    }

    fetchTransactionsThenUpdateGraph = async (accountAddress) => {
        console.log('Fetching transactions for accountAddress:', accountAddress)

        // Check if we are getting transactions for Ether or for an ERC20 Token
        const transactions = await (this.state.tokenAddress === '0x0'
            ? fetchTransactions(accountAddress, this.state.network)
            : fetchERC20Transactions(accountAddress, this.state.tokenAddress))

        console.log('Transactions for account id:', transactions)

        // This is just a catch if there is no transactions for this account, show this as a little something something
        if (transactions.length === 0) {
            console.error('No transactions returned for account:', accountAddress)
            this.setState({error: true, isLoading: false})
            return
        }

        updateTransactions(this.state.transactions, transactions)
        updateAccountTransactions(this.state.accountTxns, transactions)
        const accountNodes = accountTransactionsToNodes(this.state.accountTxns)
        updateAccountLinks(this.state.accountLinks, transactions, this.state.scaleByTransactionValue)

        const graphData = {
            nodes: accountNodes,
            links: Object.values(this.state.accountLinks),
            directed: this.state.directed,
        }

        // This triggers update/re-render so changes reflected in graph sub-component
        this.setState({
            graph: graphData,
            dataSet: true,
            isLoading: false
        })
    }

    /**
     * TODO: this should become the main update (state) function since it's used across several methods.
     */
    updateWithTransactions = (transactions) => {
        updateTransactions(this.state.transactions, transactions)
        updateAccountTransactions(this.state.accountTxns, transactions)
        const accountNodes = accountTransactionsToNodes(this.state.accountTxns)
        updateAccountLinks(this.state.accountLinks, transactions, this.state.scaleByTransactionValue)

        const graphData = {
            nodes: accountNodes,
            links: Object.values(this.state.accountLinks),
            directed: this.state.directed,
        }

        // This triggers update/re-render so changes reflected in graph sub-component
        this.setState({
            graph: graphData,
            dataSet: true,
            isLoading: false
        })
    }

    loadTransactionBacklog = () => {
        let txns = Object.values(this.state.transactionBacklogs).reduce((txns, iter) => {
            return txns.concat(iter.take(10))
        }, []);
        this.setState({backlogSize: (this.state.backlogSize - txns.length)});
        this.updateWithTransactions(txns)
    }

    isTransactionsBacklog = () => {
        for (let iter of Object.values(this.state.transactionBacklogs)) {
            if (!iter.isDone()) {
                return true
            }
        }
        return false
    }

    openDialog = () => {
        return (this.isTransactionsBacklog() && this.state.backlogSize !== 0);
    }

    closeDialog = () => {
        this.setState({backlogSize: 0});
    }


    render() {
        if (this.state.dataSet) {
            document.querySelector(".selected-node").style.visibility = "visible";
            document.querySelector(".selected-link").style.visibility = "visible";
        }

        return (
            <div className="App">
                <div className="mainContainer" style={mainContainerStyle}>
                    {/*<div>*/}
                    {/*    <button onClick={this.loadStreams}>LOAD STREAMS</button>*/}
                    {/*</div>*/}

                    <div className="selected-container">
                        <AccountInfo nodes={this.state.mouseOverNodeStream}/>
                        <LinkInfo links={this.state.linkClickedStream}/>
                    </div>

                    <AddressEntry searchHandler={this.searchHandler}
                                  onEdgeScaleChange={this.onUpdateEdgeScaling}
                                  onNetworkChange={this.onNetworkChange}
                                  onDirectionChange={this.onDirectionChange}
                                  onTokenChange={this.onTokenChange}/>

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

                <Snackbar
                    open={this.openDialog()}
                    message={
                        <div>There were {this.state.backlogSize} transactions found</div>
                    }
                    anchorOrigin={{vertical: "top", horizontal: "left"}}
                    action={
                        <div>
                            <Button size="small" color="primary" onClick={this.loadTransactionBacklog}>Continue</Button>
                            <Button size="small" color="primary" onClick={this.closeDialog}>Cancel</Button>
                        </div>
                    }

                />
            </div>
        );
    }
}


export default App;

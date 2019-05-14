import React, {Component} from 'react';
import './App.css';
import CustomGraph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import AccountInfo from './components/AccountInfo'
import LinkInfo from './components/LinkInfo'
import {createMuiTheme} from '@material-ui/core/styles';
import {fetchERC20Transactions, fetchTransactions} from "./services/api";
import {
    accountTransactionsToNodes,
    addNewTransactions,
    cacheNewTransactions,
    containsEdge, containsLink,
    toggleLabel, transactionsToLinks,
    uniqueAccountLinks,
    updateAccountTransactions,
} from "./transactionHelpers";
import SimpleStream from "./stream";

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
        /* object with 'nodes' and 'transactionsToLinks' properties */
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
    }

    searchHandler = async (address) => {
        //Reset the state first
        this.resetData();
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
                if (this.state.initialAddress === "") {
                    return;
                } else {
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
        this.fetchTransactionsThenUpdateGraph(accountAddress)
            .catch(err => console.log('App.onClickNode ERROR:', err))
    }

    onMouseOverLink = async (source, target) => {
        const link = containsLink(this.state.accountLinks, {source, target})
        toggleLabel(link, `#trans: ${link.occurrences}`)

        this.state.linkClickedStream.pub(link)
    }

    /**
     * Function to do the API call for AUD conversion ralue for ETH.
     *
     * @returns {Promise<void>}
     */
    onValueClick = async () => {
        var value, currency;
        // if we have native ETH Value in the selectedNode state object (which we always will, but just in case)
        if (this.state.selectedNode.currency === "E" || typeof this.state.currency === "undefined") {
            const rate = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=AUD").then(function (response) {
                return response.json();
            }).then(function (response) {
                return parseFloat(response.AUD);
            });

            value = parseFloat(rate * this.state.selectedNode.netValue);
            currency = "$";
        }

        // create a new object to send back as the updated state for re-render
        const updatedNode = this.state.selectedNode;
        updatedNode.currency = currency;
        updatedNode.netValue = value;

        // set the state
        this.setState({ noNodeSelected: updatedNode });
    };


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

        cacheNewTransactions(this.state.transactions, transactions)
        updateAccountTransactions(this.state.accountTxns, transactions)
        const accountNodes = accountTransactionsToNodes(this.state.accountTxns)
        transactionsToLinks(this.state.accountLinks, transactions, false)

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


    render() {
        if (this.state.dataSet) {
            document.querySelector(".selected-node").style.visibility = "visible";
            document.querySelector(".selected-link").style.visibility = "visible";
        }

        return (
            <div className="App">
                <div className="mainContainer" style={mainContainerStyle}>
                    <div className="selected-container">
                        <AccountInfo nodes={this.state.mouseOverNodeStream}/>
                        <LinkInfo links={this.state.linkClickedStream}/>
                    </div>

                    <AddressEntry searchHandler={this.searchHandler} onEdgeScaleChange={this.onUpdateEdgeScaling}
                        onNetworkChange={this.onNetworkChange} onDirectionChange={this.onDirectionChange}
                        onTokenChange={this.onTokenChange}/>

                    <CustomGraph graph={this.state.graph}
                        style={{ backgroundColor: "black" }}
                        dataSet={this.state.dataSet}
                        onClickGraph={this.onClickGraph}
                        onClickNode={this.onClickNode}
                        onHoverNode={this.onMouseOverNode}
                        onMouseOverLink={this.onMouseOverLink}
                        isLoading={this.state.isLoading}
                        error={this.state.error} />
                </div>
            </div>
        );
    }
}


export default App;

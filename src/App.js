import React, {Component} from 'react';
import './App.css';
import CustomGraph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import AccountInfo from './components/AccountInfo'
import {createMuiTheme} from '@material-ui/core/styles';
import {fetchERC20Transactions, fetchTransactions} from "./services/api";
import {
    accountTransactionsToNodes,
    addNewTransactions,
    addNewTxns,
    containsEdge,
    toggleLabel,
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


const noLinkSelected = {
    nodeA: "No Node A",
    nodeB: "No Node B",
    aToB: 0,
    bToA: 0,
    numSent: 0
}


function isBoolean(maybeBool) {
  return maybeBool === true || maybeBool === false
}


class App extends Component {
    state = {
        /* cache of all the transactions that we've fetched */
        transactions: [],

        txns: {},

        /* cache of 'account addresses' to { from => Set {transaction hashes}, to => Set{transaction hashes} } */
        accountTxns: [],

        /* Whether the graph has gone through the initial load yet */
        dataSet: false,
        /* object with 'nodes' and 'links' properties */
        graph: emptyGraph,
        /* empty node placeholder for the node details on hover */
        selectedNode: noNodeSelected,
        /* empty link placeholder for the link details on click */
        selectedLink: noLinkSelected,
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
    }

        /* Whenever the user 'hovers' over a node, the node / account info should be
        * published to this stream. */
        mouseOverNodeStream: SimpleStream(),
    }

    onMouseOverNode = (accountAddress) => {
        const txns = this.state.accountTxns[accountAddress]
        console.log(`Mouse over node: address = ${accountAddress}, transactions =`, txns)

        let grossFrom = 0
        for (const hash of txns.from) {
            // console.log('from txn hash:', hash)
            grossFrom += this.state.txns[hash].value / Math.pow(10, 18)
        }

        let grossTo = 0
        for (const hash of txns.to) {
            // console.log('to txn hash:  ', hash)
            grossTo += this.state.txns[hash].value / Math.pow(10, 18)
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
            transactions: [],
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
        console.log("Reset the nodes")
    }

    onClickNode = async (accountAddress) => {
        this.setState({ isLoading: true });
        this.fetchTransactionsThenUpdateGraph(accountAddress)
            .catch(err => console.log('App.onClickNode ERROR:', err))
    }

    onClickLink = async (source, target) => {
        const edge = {
            source: source,
            target: target
        }
        const link = containsEdge(this.state.graph.links, edge)
        toggleLabel(link, `#trans: ${link.occurences}`)

        const myLink = {
            nodeA: link.source,
            nodeB: link.target,
            aToB: link.sent,
            bToA: link.recv,
            numSent: link.occurences,
        }
        this.setState({ selectedLink: myLink });
        console.log('onClickLink myLink =', myLink)

        // Update the selected node property of state to update div
        //this.setState({selectedLink: myLink);
        //console.log('config', this.state.graph)
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
            this.setState({error: true, isLoading: false})
            return
        }

        // NOTE(Loughlin): I don't think this will trigger component update.
        // DEPRECATED - this state will be removed eventually.
        addNewTransactions(this.state.transactions, transactions)

        addNewTxns(this.state.txns, transactions)
        updateAccountTransactions(this.state.accountTxns, transactions)

        const accountNodes = accountTransactionsToNodes(this.state.accountTxns)
        const accountLinks = uniqueAccountLinks(this.state.transactions, this.state.scaleByTransactionValue)
        console.log('account nodes:', accountNodes)
        console.log('account links:', accountLinks)

        const graphData = {
            nodes: accountNodes,
            links: accountLinks,
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

                        <div className="selected-link">
                            <h4>{"Link Selected"}</h4>
                            <div className="row">
                                <div>Node A ID</div>
                                <div>{this.state.selectedLink.nodeA}</div>
                            </div>
                            <div className="row">
                                <div>Node B ID</div>
                                <div>{this.state.selectedLink.nodeB}</div>
                            </div>
                            <div className="row">
                                <div>Amount sent: A to B</div>
                                <div>{this.state.selectedLink.aToB}</div>
                            </div>
                            <div className="row">
                                <div>Amount sent: B to A</div>
                                <div>{this.state.selectedLink.bToA}</div>
                            </div>
                            <div className="row">
                                <div>Total Number of Transactions</div>
                                <div>{this.state.selectedLink.numSent}</div>
                            </div>
                        </div>
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
                        onClickLink={this.onClickLink}
                        isLoading={this.state.isLoading}
                        error={this.state.error} />
                </div>
            </div>
        );
    }
}


export default App;

import React, {Component} from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CustomGraph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import {createMuiTheme} from '@material-ui/core/styles';
import {fetchTransactions} from "./services/api";
import {
	uniqueAccountAddresses, containsEdge,
	uniqueAccountLinks, transactionsForAccount, addNewTransactions,
	highlightLink, getNode, toggleLabel,
} from "./transactionHelpers";

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
    numTo: 0,
    numFrom: 0,
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


class App extends Component {
    state = {
        /* cache of all the transactions that we've fetched */
        transactions: [],
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
        scaleByTransactionValue: false
    }

    componentDidMount = async () => {
    }


    onMouseOverNode = (accountAddress) => {
        /* Display the accountId, the number of transactions from this address,
        the number of transactions to this address and the net value of this
        node */

        const transactions = transactionsForAccount(accountAddress, this.state.transactions)
        const num_from = transactions.fromAddress.length;
        const num_to = transactions.toAddress.length;

        var gross_from = 0;
        var gross_to = 0;
        for (var i = 0; i < num_from; i++) {
    		gross_from += transactions.fromAddress[i].value / Math.pow(10, 18);
    	};
        for (var i = 0; i < num_to; i++) {
    		gross_to += transactions.toAddress[i].value / Math.pow(10, 18);
    	};

        const net_value = gross_to - gross_from;
        const myNode = {
            id: accountAddress,
            numTo: num_to,
            numFrom: num_from,
            netValue: net_value,
            currency: "E",
        };

        // Update the selected node property of state to update div
        this.setState({selectedNode: myNode});
    }

    searchHandler = async (address) => {
		this.setState({isLoading: true});
        this.fetchTransactionsThenUpdateGraph(address)
            .catch(err => console.log('App.searchHandler ERROR:', err))
    }

    onUpdateEdgeScaling = (newEdgeScaling) => {
        console.log("Updating Edge Scale Type in app")
        console.log(newEdgeScaling)
        if (newEdgeScaling == "Transaction Value") {
            this.setState({scaleByTransactionValue: true})
        } else if (newEdgeScaling == "Transaction Count") {
            this.setState({scaleByTransactionValue: false})
        }
    }

    onClickGraph = async () => {
        console.log("Reset the nodes")
    }

    onClickNode = async (accountAddress) => {
		this.setState({isLoading: true});
        this.fetchTransactionsThenUpdateGraph(accountAddress)
            .catch(err => console.log('App.onClickNode ERROR:', err))
    }

    onClickLink = async (source, target) => {
		var edge = {
			source: source,
			target: target
		}
        const link = containsEdge(this.state.graph.links, edge)
        // Toggle the label
        //toggleLabel(link, `Sent: ${link.sent} Recv: ${link.recv}`)
        toggleLabel(link, `#trans: ${link.occurences}`)

		const myLink = {
			nodeA: link.source,
			nodeB: link.target,
			aToB: link.sent,
			bToA: link.recv,
			numSent: link.occurences,
		}
		this.setState({selectedLink: myLink});
		console.log(myLink)
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
        this.setState({noNodeSelected: updatedNode});
    };


    fetchTransactionsThenUpdateGraph = async (accountAddress) => {
        console.log('Finding transactions for accountAddress:', accountAddress)
        const transactions = await fetchTransactions(accountAddress)
        console.log('Transactions for account id:', transactions)

        // NOTE(Loughlin): I don't think this will trigger component update?
        addNewTransactions(this.state.transactions, transactions)

        const accountHashes = uniqueAccountAddresses(this.state.transactions)
        const accountLinks = uniqueAccountLinks(this.state.transactions, this.state.scaleByTransactionValue)
        const graphData = {
            nodes: accountHashes,
            links: accountLinks,
        }

        // This triggers update/re-render so changes reflected in graph sub-component
        this.setState({graph: graphData, dataSet: true, isLoading: false})
    }


    render() {
        if (this.state.dataSet) {
            document.querySelector(".selected-node").style.visibility = "visible";
						document.querySelector(".selected-link").style.visibility = "visible";
        }
        return (
            <div className="App">
                <div className="mainContainer" style={mainContainerStyle}>
										<div className="selected-node">
                        <h4>{this.state.selectedNode.id}</h4>
                        <div class="row">
                            <div>Outgoing Transactions</div>
                            <div>{this.state.selectedNode.numFrom}</div>
                        </div>
                        <div class="row">
                            <div>Incoming Transactions</div>
                            <div>{this.state.selectedNode.numTo}</div>
                        </div>
                        <div class="row">
                            <div>Node Net Value</div>
                            <div class="price-hover" onClick={this.onValueClick}>{this.state.selectedNode.currency}{this.state.selectedNode.netValue}</div>
                        </div>
                    </div>
										<div className="selected-link">
                        <h4>{"Link Selected"}</h4>
                        <div class="row">
                            <div>Node A ID</div>
                            <div>{this.state.selectedLink.nodeA}</div>
                        </div>
                        <div class="row">
														<div>Node B ID</div>
														<div>{this.state.selectedLink.nodeB}</div>
                        </div>
                        <div class="row">
                            <div>Amount sent from A to B</div>
														<div>{this.state.selectedLink.aToB}</div>
                        </div>
												<div class="row">
                            <div>Amount sent from B to A</div>
														<div>{this.state.selectedLink.bToA}</div>
                        </div>
												<div class="row">
                            <div>Total Number of Transactions</div>
														<div>{this.state.selectedLink.numSent}</div>
                        </div>
                    </div>
                    <AddressEntry searchHandler={this.searchHandler} onEdgeScaleChange={this.onUpdateEdgeScaling}/>
                    <CustomGraph graph={this.state.graph}
                                 style={{backgroundColor: "black"}}
                                 dataSet={this.state.dataSet}
                                 onClickGraph={this.onClickGraph}
                                 onClickNode={this.onClickNode}
                                 onHoverNode={this.onMouseOverNode}
                                 onClickLink={this.onClickLink}
                                 isLoading={this.state.isLoading}/>
                </div>
            </div>
        );
    }
}


export default App;

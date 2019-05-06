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
	uniqueAccountLinks, transactionsForAccount, addNewTransactions
} from "./transactionHelpers";

const mainContainerStyle = {
    height: "100vh",
    // marginTop: "5px",
    display: 'block',
    width: '100%',
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
    netValue: 0
};

const noLinkSelected = {
    source: "No source",
    destination: "No destination",
    number: 0,
    value: 0
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
				selectedLink: noLinkSelected
    }

    componentDidMount = async () => {
    }


    onMouseOverNode = (accountAddress) => {
        // Display the accountId, the number of transactions from this address,
        // the number of transactions to this address and the net value of this
        // node

        const transactions = transactionsForAccount(accountAddress, this.state.transactions)
        const num_from = transactions.fromAddress.length;
        const num_to = transactions.toAddress.length;

        // console.log(`Transactions for account (hover) ${accountAddress}:`, transactions);
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
            netValue: net_value
        };

        // Update the selected node property of state to update div
        this.setState({selectedNode: myNode});

        console.log('config', this.state.graph)

        // after this is done, where do we find how the fuck to write for when we stop hovering
    }


    searchHandler = async (address) => {
        this.fetchTransactionsThenUpdateGraph(address)
            .catch(err => console.log('App.searchHandler ERROR:', err))
    }


    onClickNode = async (accountAddress) => {
        this.fetchTransactionsThenUpdateGraph(accountAddress)
            .catch(err => console.log('App.onClickNode ERROR:', err))
    }

    onClickLink = async (source, target) => {
				var edge = {
					source: source,
					target: target
				}
        const link = containsEdge(this.state.graph.links, edge)
				const myLink = {
					source: link.source,
					destination: link.target,
					number: link.occurences,
					value: link.value,
				}
				console.log(myLink)
				// Update the selected node property of state to update div
				//this.setState({selectedLink: myLink);
				//console.log('config', this.state.graph)
    }


    fetchTransactionsThenUpdateGraph = async (accountAddress) => {
        console.log('Finding transactions for accountAddress:', accountAddress)
        const transactions = await fetchTransactions(accountAddress)
        console.log('Transactions for account id:', transactions)

        // NOTE(Loughlin): I don't think this will trigger component update?
        addNewTransactions(this.state.transactions, transactions)

        const accountHashes = uniqueAccountAddresses(this.state.transactions)
        const accountLinks = uniqueAccountLinks(this.state.transactions)
        const graphData = {
            nodes: accountHashes,
            links: accountLinks,
        }

        // This triggers update/re-render so changes reflected in graph sub-component
        this.setState({graph: graphData, dataSet: true})
    }


    render() {
        return (
            <div className="App">
                <div className="mainContainer"
                     style={mainContainerStyle}>
                    <div className="selected-node">
                        <h4>{this.state.selectedNode.id}</h4>
                        <div class="row">
                            <div>Transactions In</div>
                            <div>{this.state.selectedNode.numFrom}</div>
                        </div>
                        <div class="row">
                            <div>Transactions Out</div>
                            <div>{this.state.selectedNode.numTo}</div>
                        </div>
                        <div class="row">
                            <div>Net Transfer Value</div>
                            <div>{this.state.selectedNode.netValue}</div>
                        </div>
                    </div>
                    <div className="node-info">
                        <span>Node</span>
                        <ul style={{padding: '0px', margin: '0px', listStyleType: 'square'}}>

                        </ul>
                    </div>
                    <AddressEntry searchHandler={this.searchHandler}/>
                    <CustomGraph graph={this.state.graph}
                                 style={{backgroundColor: "black",}}
                                 dataSet={this.state.dataSet}
                                 onClickNode={this.onClickNode}
                                 onHoverNode={this.onMouseOverNode}
                                 onClickLink={this.onClickLink}/>
                </div>
            </div>
        );
    }
}


export default App;

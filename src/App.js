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
<<<<<<< HEAD
	uniqueAccountAddresses, getLink,
	uniqueAccountLinks, transactionsForAccount, addNewTransactions
=======
    uniqueAccountAddresses, linkOccurences,
    uniqueAccountLinks, transactionsForAccount, addNewTransactions
>>>>>>> f460924cbe9c177834fe224d6abf071fa805c23b
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
    id: "None Selected",
    numTo: 0,
    numFrom: 0,
    netValue: 0
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
        selectedNode: noNodeSelected
    }

    componentDidMount = async () => {
    }


    onMouseOverNode = (accountAddress) => {
        // Display the accountId and number of transactions involved with
        // this address
        const transactions = transactionsForAccount(accountAddress, this.state.transactions)
        console.log(`Transactions for account (hover) ${accountAddress}:`, transactions)
        // const from_address = transactions.fromAddress.length;
        // const to_address = transactions.toAddress.length;
        // const accountID = accountAddress;
        // console.log(accountID, number_of_transactions)

        const myNode = {
            id: accountAddress,
            numTo: 100, // to_address etc etc
            numFrom: 100,
            netValue: 100
        };

        // {graph: graphData, dataSet: true}
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
        const occurences = linkOccurences(source, target, this.state.graph.links)
        console.log(`Clicked link between ${source} and ${target}\nThe number of transactions between them is ${occurences}`)
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
                        <div><h1>{this.state.selectedNode.id}</h1></div>
                        <div>{this.state.selectedNode.numFrom}</div>
                        <div>{this.state.selectedNode.numTo}</div>
                        <div>{this.state.selectedNode.netValue}</div>
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


function accountHashToAccountNode(accountHash) {
    return {id: accountHash}
}


export default App;

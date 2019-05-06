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
    uniqueAccountAddresses,
    uniqueAccountLinks, transactionsForAccount, addNewTransactions
} from "./transactionHelpers";

const mainContainerStyle = {
    height: "100vh",
    // marginTop: "5px",
    width: '100%',
    backgroundColor: "#241e56",
    textAlign: "center",
    color: "white",
		position:'relative'
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
		/* cache of all the transactions that we've fetched */
		transactions: [],
		/* Whether the graph has gone through the initial load yet */
    dataSet: false,
		/* object with 'nodes' and 'links' properties */
    graph: emptyGraph,
  }

  componentDidMount = async () => {
  }


  onMouseOverNode = (accountAddress) => {
  	// Display the accountId metadata on mouse hover
		const transactions = transactionsForAccount(accountAddress, this.state.transactions)
		console.log(`Transactions for account ${accountAddress}:`, transactions)
  }


  searchHandler = async (address) => {
		this.fetchTransactionsThenUpdateGraph(address)
			.catch(err => console.log('App.searchHandler ERROR:', err))
  }


  onClickNode = async (accountAddress) => {
		this.fetchTransactionsThenUpdateGraph(accountAddress)
			.catch(err => console.log('App.onClickNode ERROR:', err))
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
		this.setState({ graph: graphData, dataSet: true })
	}


  render() {
    return (
      <div className="App">
        <div className="mainContainer"
          style={mainContainerStyle}>
					<div className="legend">
									<span>Transactions</span>
					 			<ul style={{padding:'0px', margin:'0px', listStyleType:'square'}}>
					 				<li style={{background:'red'}}>10 -20</li>
									<li style={{background: 'green'}}>20 - 30</li>
								</ul>
					</div>
					<div className="nodeInformation">

					</div>
					<AddressEntry searchHandler={this.searchHandler}/>
					<CustomGraph graph={this.state.graph}
											 style={{backgroundColor: "black",}}
											 dataSet={this.state.dataSet}
											 onClickNode={this.onClickNode}
											 onHover={this.onMouseOverNode}/>



        </div>
      </div>
    );
  }
}


function accountHashToAccountNode(accountHash) {
    return {id: accountHash}
}


export default App;

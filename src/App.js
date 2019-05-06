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
    display: 'block',
    width: '100%',
    backgroundColor: "#241e56",
    textAlign: "center",
    color: "white",
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
			nodes: accountHashes.map(accountHashToAccountNode),
			links: accountLinks,
		}

		// This triggers update/re-render so changes reflected in graph sub-component
		this.setState({ graph: graphData, dataSet: true })
	}


  render() {
    return (
<<<<<<< HEAD
      <div className="App" style={{backgroundColor: "#241e56"}}>
        <AppBar position="static" style={{backgroundColor: "#241e56"}}>
          <Toolbar>
            <Typography variant="h5" color="inherit" style={{ paddingRight: "50px" }}>
              Transaction Visualizer
						</Typography>
            <AddressEntry searchHandler={this.searchHandler} />
          </Toolbar>
        </AppBar>

        <div className="mainContainer">
          <CustomGraph style={{backgroundColor: "black"}} graph={this.state.graph} dataSet={this.state.dataSet}/>
=======
      <div className="App">


        <div className="mainContainer"
          style={mainContainerStyle}>
					<div style={{right:'5px', top: '5px', padding: '30px', backgroundColor: 'white'
												, poistion:'absolute', float:"right", marginTop:'30px', marginRight:'20px'}}>
								<span>Legend</span>
					</div>
          <AddressEntry searchHandler={this.searchHandler}
					style={{backgroundColor:"white"}}/>
					<CustomGraph graph={this.state.graph}
											 style={{backgroundColor: "black", zIndex:2}}
											 dataSet={this.state.dataSet}
											 onClickNode={this.onClickNode}
											 onHover={this.onMouseOverNode}/>
>>>>>>> 7774c1bbe507f425ac7b96d6b93d3324721cdcf6
        </div>

      </div>
    );
  }
}


function accountHashToAccountNode(accountHash) {
	return { id: accountHash }
}


export default App;

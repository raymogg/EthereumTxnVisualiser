import React, { Component } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CustomGraph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import { createMuiTheme } from '@material-ui/core/styles';
import { fetchTransactions } from "./services/api";
import {containsNode, processTransactions} from "./visualisation";

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

const data = {
  nodes: [],
  links: []
};


class App extends Component {

  state = {
    graph: data,
    dataSet: false
  }

  componentDidMount = async () => {

  }

  onMouseOverNode = (node) => {
      // Display the node metadata on mouse hover
      const n = this.state.graph.nodes.find(n => n.id === node)
      console.log('NODE', n)
      console.log('Node ID', n.id)
      console.log('Node GAS', n.gas)
  }

  searchHandler = async (address) => {
    let transactions = await fetchTransactions(address)
		this.setState({ transactions })
    let graph = processTransactions(transactions)
    console.log('searchHandler:graph:', graph)

    var nodes = graph.nodes

    var edges = (graph.edges)

    var graphData = {
      nodes: nodes,
      links: edges
    }

    this.setState({ graph: graphData, dataSet: true })
  }

  onClickNode = (nodeId) => {
		let state = this.state
		console.log('onClickNode:', nodeId, state)

		fetchTransactions(nodeId)
			.then(transactions => {
				console.log('transactions', transactions)
				// add transaction to existing ones
				for (const transaction of transactions) {
					const newToNode = { id: transaction.to, ...transaction }
					if (!containsNode(this.state.graph.nodes, newToNode)) {
						console.log('adding:', newToNode)
						this.state.graph.nodes.push(newToNode)
					}

					const newFromNode = { id: transaction.to, ...transaction }
					if (!containsNode(this.state.graph.nodes, newFromNode)) {
						console.log('adding:', newFromNode)
						this.state.graph.nodes.push(newFromNode)
					}
				}
			})
	}

  render() {
    return (
      <div className="App">
        <AppBar position="static" color='primary'>
          <Toolbar>
            <Typography variant="h5" color="inherit" style={{ paddingRight: "50px" }}>
              Transaction Visualizer
						</Typography>
          </Toolbar>
        </AppBar>

        <div className="mainContainer"
          style={{ paddingLeft: '25px', paddingRight: '25px', paddingTop: '15px' }}>
          <AddressEntry searchHandler={this.searchHandler} />
					<CustomGraph graph={this.state.graph}
											 style={{backgroundColor: "black"}}
											 dataSet={this.state.dataSet}
											 onClickNode={this.onClickNode}
                                             onHover={this.onMouseOverNode}/>
        </div>

      </div>
    );
  }
}

// function App() {
//   return (
//     <div className="App">
//       <AppBar position="static"  color='primary'>
//         <Toolbar>
//           <Typography variant="h5" color="inherit" style={{ paddingRight: "50px" }}>
//             Transaction Visualizer
//           </Typography>
//         </Toolbar>
//       </AppBar>
//       <div className="mainContainer" style={{ paddingLeft: '25px', paddingRight: '25px', paddingTop: '15px'}}>
//         <AddressEntry />
//         <Graph />
//       </div>
//
//     </div>
//   );
// }

export default App;

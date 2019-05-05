import React, { Component } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CustomGraph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import { createMuiTheme } from '@material-ui/core/styles';
import { fetchTransactions } from "./services/api";
import { processTransactions } from "./visualisation";

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
    let graph = processTransactions(transactions)
    console.log('searchHandler:graph:', graph)

    // var nodes = Object.keys(graph.nodes).map((id) => {
    //   return { id: id }
    // })
    var nodes = graph.nodes

    var edges = (graph.edges)

    var graphData = {
      nodes: nodes,
      links: edges
    }

    this.setState({ graph: graphData, dataSet: true }, alert("State updated"))


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
          <CustomGraph graph={this.state.graph} dataSet={this.state.dataSet} onHover={this.onMouseOverNode}/>
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

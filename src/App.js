import React from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Graph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';


function App() {
  return (
    <div className="App">
      <AppBar position="static" style={{ backgroundColor: "#2A2B2A" }}>
        <Toolbar>
          <Typography variant="h5" color="inherit" style={{ paddingRight: "50px" }}>
            Transaction Visualizer
          </Typography>
        </Toolbar>
      </AppBar>
      <div className="mainContainer" style={{ paddingLeft: '25px', paddingRight: '25px', paddingTop: '15px'}}>
        <AddressEntry />
        <Graph />
      </div>

    </div>
  );
}

export default App;

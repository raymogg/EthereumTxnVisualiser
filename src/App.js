import React, {Component} from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Graph from "./components/Graph.js"
import AddressEntry from './components/AddressEntry';
import { createMuiTheme } from '@material-ui/core/styles';

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


class App extends Component {
	componentDidMount = async () => {

	}

	render() {
  	return (
			<div className="App">
				<AppBar position="static"  color='primary'>
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

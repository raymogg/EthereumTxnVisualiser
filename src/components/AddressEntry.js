import React, { Component } from 'react';
import Button from '@material-ui/core/Button'
import "./AddressEntry.css";
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';


const paperStyle = {
    height: "100%",
    width: "100%",
    margin: 5,
    paddingLeft: 5,
    paddingRight: 5,
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent"
};


class AddressEntry extends Component {
    state = {
        address: "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a",
        open: false,
        edgeScaleSetting: "Transaction Count",
        showKey: true,
        network: "mainnet"
    };

    constructor(props) {
        super(props);
    }

    onOpen = () => {
        this.setState({ open: true })
    }

    onClose = () => {
        this.setState({ open: false })
    }

    componentDidMount = async () => {
    }

    handleChange = event => {
        this.setState({ address: event.target.value })
    }

    handleSelectChange = event => {
        console.log("Updating Edge Scale Type in address entry")
        this.setState({ edgeScaleSetting: event.target.value })
        //Notify the app that a setting has changes
        this.props.onEdgeScaleChange(event.target.value)
    }

    handleShowKeyChange = event => {
        console.log("Updating setting to show key")
        this.setState({showKey: event.target.value})
    }

    handleNetworkChange = event => {
        console.log("Updating setting for network selector")
        this.setState({network: event.target.value})
        this.props.onNetworkChange(event.target.value)
    }

    onSearch = () => {
        this.props.searchHandler(this.state.address)
            .catch(function (error) {
                console.log('AddressEntry.onSearch ERROR', error);
            })
    }

    render() {
        var key;
        if (this.state.showKey == true) {
            if (this.state.edgeScaleSetting == "Transaction Value") {
                key = <div style={{marginLeft: '5px'}}>
                    <Typography style={{ padding: '4px', marginLeft: '4px', marginRight: '4px', backgroundColor: "transparent", color: "#fffff" }}> Scale Key </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#007bff" }}> 0 - 1 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#28a745" }}> 1 - 5 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#ffc107" }}> 5 - 50 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#dc3545" }}> 50 - 100 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#6c757d" }}> 100+ ETH </Typography>
                </div>

            } else if (this.state.edgeScaleSetting == "Transaction Count") {
                key = <div style={{marginLeft: '5px'}}>
                    <Typography style={{ padding: '4px', backgroundColor: "transparent", color: "#ffffff" }}> Scale Key </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#007bff" }}> 0 - 5 Transactions </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#28a745" }}> 5 - 15 Transactions </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#ffc107" }}> 15 - 30 Transactions </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#dc3545" }}> 30 - 50 Transactions </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#6c757d" }}> 50+ Transactions </Typography>
                    </div>
            }
        } else {
            key = ""
        }
        return (
            <div className="search">
                <div className="searchInput">
                    <input
                        id="address-entry"
                        label="Start Address"
                        type="text"
                        value={this.state.address}
                        onChange={this.handleChange}
                        autoFocus={true}
                        style={{ backgroundColor: 'white', width: '380px' }}
                    />
                    <div className="search-button">
                        <button onClick={this.onSearch}>
                            Search
						</button>
                    </div>
                </div>
                <div className="search-button">
                    <button onClick={this.onOpen}>
                        Settings
					</button>
                </div>
                {key}
                <Dialog open={this.state.open} onClose={this.onClose} aria-labelledby="simple-dialog-title"
                    stlye={{ margin: '30px' }}>
                    <DialogTitle id="simple-dialog-title">Settings</DialogTitle>
                    <DialogContent>
                        <InputLabel htmlFor="edge-scale">Scale Edges by </InputLabel>
                        <Select
                            value={this.state.edgeScaleSetting}
                            onChange={this.handleSelectChange}
                            inputProps={{
                                name: 'Scale Edges by...',
                                id: 'edge-scale',
                            }}
                        >
                            <MenuItem value={"Transaction Count"}>Transaction Count</MenuItem>
                            <MenuItem value={"Transaction Value"}>Transaction Value</MenuItem>
                        </Select>
                    </DialogContent>
                    <DialogContent>
                        <InputLabel htmlFor="edge-scale">Show Scale Key </InputLabel>
                        <Select
                            value={this.state.showKey}
                            onChange={this.handleShowKeyChange}
                            inputProps={{
                                name: 'Scale Edges by...',
                                id: 'edge-scale',
                            }}
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </DialogContent>
                    <DialogContent>
                        <InputLabel htmlFor="edge-scale">Network</InputLabel>
                        <Select
                            value={this.state.network}
                            onChange={this.handleNetworkChange}
                            inputProps={{
                                name: 'Select network',
                                id: 'select-network',
                            }}
                        >
                            <MenuItem value={"mainnet"}>Ethereum Main Network</MenuItem>
                            <MenuItem value={"testnet"}>Ethereum Ropsten Test Network</MenuItem>
                        </Select>
                    </DialogContent>
                    <Button onClick={this.onClose} style={{ flex: 1, flexDirection: 'row', alignContent: 'center' }}> Close </Button>
                </Dialog>
            </div>
        )
    }
}

export default withStyles(paperStyle)(AddressEntry);

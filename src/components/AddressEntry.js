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
import { SHA3 } from 'sha3';

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

    onCloseError = () => {
        this.setState({addressError: false})
    }

    onOpenError = () => {
        this.setState({addressError: true})
    }

    componentDidMount = async () => {
    }

    handleChange = event => {
        //Validate the address and if its not an address show an error
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
        this.setState({ showKey: event.target.value })
    }

    handleNetworkChange = event => {
        console.log("Updating setting for network selector")
        this.setState({ network: event.target.value })
        this.props.onNetworkChange(event.target.value)
    }

    onSearch = () => {
        if (!this.addressValidator(this.state.address)) {
            //Show not a valid address popup
            this.setState({addressError: true})
            return;
        }
        this.props.searchHandler(this.state.address)
            .catch(function (error) {
                console.log('AddressEntry.onSearch ERROR', error);
            })
    }


    addressValidator = (address) => {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            // check if it has the basic requirements of an address
            return false;
        } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
            // If it's all small caps or all all caps, return true
            return true;
        } else {
            // Otherwise check each case
            return this.addressChecksumValidator(address);
        }
    }

    addressChecksumValidator = (address) => {
        address = address.replace('0x', '');
        var addressHash = SHA3(address.toLowerCase());
        for (var i = 0; i < 40; i++) {
            // the nth letter should be uppercase if the nth digit of casemap is 1
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                return false;
            }
        }
        return true;
    }

    render() {
        var key;
        if (this.state.showKey == true) {
            if (this.state.edgeScaleSetting == "Transaction Value") {
                key = <div style={{ marginLeft: '5px' }}>
                    <Typography style={{ padding: '4px', marginLeft: '4px', marginRight: '4px', backgroundColor: "transparent", color: "#fffff" }}> Scale Key </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#007bff" }}> 0 - 1 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#28a745" }}> 1 - 5 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#ffc107" }}> 5 - 50 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#dc3545" }}> 50 - 100 ETH </Typography>
                    <Typography style={{ padding: '4px', backgroundColor: "#6c757d" }}> 100+ ETH </Typography>
                </div>

            } else if (this.state.edgeScaleSetting == "Transaction Count") {
                key = <div style={{ marginLeft: '5px' }}>
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
                        <InputLabel htmlFor="select-network">Network </InputLabel>
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
                <Dialog open={this.state.addressError} onClose={this.onCloseError} aria-labelledby="simple-dialog-title"
                    stlye={{ margin: '30px' }}>
                    <DialogTitle id="simple-dialog-title">Please Enter a Valid Ethereum Address</DialogTitle>
                    <DialogContent>
                    </DialogContent>
                    <Button onClick={this.onCloseError} style={{ flex: 1, flexDirection: 'row', alignContent: 'center' }}> Ok </Button>
                </Dialog>
            </div>
        )
    }
}

export default withStyles(paperStyle)(AddressEntry);

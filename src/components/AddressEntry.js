import React, { Component } from 'react';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import "./AddressEntry.css";
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';


class AddressEntry extends Component {
    state = {
        address: "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a",
        open: false,
        edgeScaleSetting: "Transaction Count"
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

    onSearch = () => {
        this.props.searchHandler(this.state.address)
            .catch(function (error) {
                console.log('AddressEntry.onSearch ERROR', error);
            })
    }

    render() {
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
                    <Button onClick={this.onClose} style={{flex:1, flexDirection: 'row', alignContent: 'center'}}> Close </Button>
                </Dialog>
            </div>
        )
    }
}

export default (AddressEntry);

import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { fetchTransactions } from "../services/api.js";
import { processTransactions, addTransactions } from "../visualisation";

const paperStyle = {
    height: "100%",
    marginTop: "5px",
    flex: 1,
    flexDirection: "row",
    marginLeft: '20px',
    marginRight: '20px',
};

class AddressEntry extends Component {

    state = {
        address: "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a"
    };

    componentDidMount = async (input) => {
        console.log('addressentry:input:', input);
        // fetchTransactions(this.onComplete, this.state.address)
        // 	.then(function(transactions) {
        // 		return processTransactions(transactions)
        // 	}).then(function({nodes, edges}) {
        //
        // 	})

        let transactions = await fetchTransactions(this.state.address)
        let graph = processTransactions(transactions)
    }

    handleChange = event => {
        this.setState({ address: event.target.value })
    }

    onSearch = () => {
        alert("Starting search for: " + this.state.address)
    }

    render() {
        return (
            <div>
                <div style={{ flex: 1, alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
                    <TextField
                        id="address-entry"
                        label="Start Address"
                        value={this.state.address}
                        onChange={this.handleChange}

                    />
                    <Button variant="contained" color="primary" style={{ marginLeft: '10px' }}
                        onClick={this.onSearch}> Search </Button>
                </div>
            </div>
        )
    }
}

export default (AddressEntry);

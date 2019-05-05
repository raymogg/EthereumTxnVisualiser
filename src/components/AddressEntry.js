import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';

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
        address: "0x0"
    };

    componentDidMount = async () => {

    }

    handleChange = (text) => {
        this.setState({address: text})
    }

    render() {
        return (
            <div>
                <Paper style={paperStyle}>
                    <TextField
                        id="addess-entry"
                        label="Start Address"
                        value={this.state.address}
                        onChange={this.handleChange}
                        margin="normal"
                    />
                    <Button> Search </Button>
                </Paper>
            </div>
        )
    }
}

export default (AddressEntry);


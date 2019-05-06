import React, { Component } from 'react';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';





class AddressEntry extends Component {
    state = {
        address: "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a"
    };

    constructor(props) {
        super(props);
    }

    componentDidMount = async () => {
    }

    handleChange = event => {
        this.setState({ address: event.target.value })
    }

    onSearch = () => {
			this.props.searchHandler(this.state.address)
				.catch(function(error) {
					console.log('AddressEntry.onSearch ERROR', error);
				})
		}

    render() {
        return (
            <div>
                <div style={{alignItems: 'center', justifyContent: 'center',zIndex:'1'}}>
                    <TextField
                        id="address-entry"
                        label="Start Address"
                        value={this.state.address}
                        onChange={this.handleChange}
                        style={{color: "#ffffff"}}
                    />
									<Button
										variant="contained"
										color="primary"
										style={{marginLeft: '10px', zIndex: "4"}}
										onClick={this.onSearch}>
										Search
									</Button>
                </div>
            </div>
        )
    }
}

export default (AddressEntry);

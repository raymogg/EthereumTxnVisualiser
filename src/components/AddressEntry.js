import React, { Component } from 'react';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import "./AddressEntry.css";

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
            <div className="search">
                <div className="searchInput">
                    <input
                        id="address-entry"
                        label="Start Address"
                        type="text"
                        value={this.state.address}
                        onChange={this.handleChange}
                        autoFocus={true}
                        style={{backgroundColor:'white', width:'380px'}}
                    />
                <div className="search-button">
									<button onClick={this.onSearch}>
										Search
									</button>
                </div>
              </div>
            </div>
        )
    }
}

export default (AddressEntry);

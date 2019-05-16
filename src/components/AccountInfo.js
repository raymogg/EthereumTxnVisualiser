import React, {Component} from 'react';


export default class AccountInfo extends Component {
    state = {
        selectedNode: {
            id: 'accountAddress',
            transactionsToCount: 10,
            transactionsFromCount: 10,
            netValue: 10,
            currency: 'E',
        },
    }

    componentDidMount() {
        this.props.nodes.sub(selectedNode => {
            this.setState({ selectedNode })
            this.convert_currency(selectedNode)
        })
        this.props.currency.sub(currency => {
            this.setState({currency: currency})
        })
    }
    /**
        Function which also does the api call for aud conversion value to Eth
        Will only convert if the settings are set to aud. Otherwise default is
        eth.

        @returns {promise<void>}
    */
    convert_currency = async(node) => {
      var newNetValue = node.netValue
        //Only convert if the graph currency is $ default for nodes and links is eth
        if (this.state.currency === "$") {
            const rate = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=AUD").then(function (response) {
                return response.json();
            }).then(function (response) {
                return parseFloat(response.AUD);
            });
            var newNetValue = parseFloat(rate * newNetValue);
        }
        this.setState({netValue: newNetValue})
    };

    /**
     * Function to do the API call for AUD conversion ralue for ETH.
     *
     * @returns {Promise<void>}
    onValueClick = async () => {
        var value, currency;
        console.log(this.state.selectedNode)
        // if we have native ETH Value in the selectedNode state object (which we always will, but just in case)
        if (this.state.selectedNode.currency === "E") {
            const rate = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=AUD").then(function (response) {
                return response.json();
            }).then(function (response) {
                return parseFloat(response.AUD);
            });

            value = parseFloat(rate * this.state.selectedNode.netValue);
            currency = "$";
        } else {
            const rate = await fetch("https://min-api.cryptocompare.com/data/price?fsym=AUD&tsyms=ETH").then(function (response) {
                return response.json();
            }).then(function (response) {
                console.log(response)
                return parseFloat(response.ETH);
            });
            value = parseFloat(rate * this.state.selectedNode.netValue);
            currency = "E";
        }
        // create a new object to send back as the updated state for re-render
        const updatedNode = this.state.selectedNode;
        updatedNode.currency = currency;
        updatedNode.netValue = value;
        console.log(this.state.selectedNode)
        // set the state
        this.setState({ noNodeSelected: updatedNode });
    };*/

    render() {
        return (
            <div className="selected-node">
                <h4>{this.state.selectedNode.id}</h4>
                <div className="row">
                    <div>Outgoing Transactions</div>
                    <div>{this.state.selectedNode.transactionsFromCount}</div>
                </div>
                <div className="row">
                    <div>Incoming Transactions</div>
                    <div>{this.state.selectedNode.transactionsToCount}</div>
                </div>
                <div className="row">
                    <div>Node Net Value</div>
                    <div>({this.state.currency}){this.state.netValue}</div>
                </div>
            </div>
        )
    }
}

//<div className="price-hover" onClick={this.onValueClick}>{this.state.selectedNode.currency}{this.state.selectedNode.netValue}</div>

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
        })
    }

    /**
     * Function to do the API call for AUD conversion ralue for ETH.
     *
     * @returns {Promise<void>}
     */
    onValueClick = async () => {
        var value, currency;
        // if we have native ETH Value in the selectedNode state object (which we always will, but just in case)
        if (this.state.selectedNode.currency === "E" || typeof this.state.currency === "undefined") {
            const rate = await fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=AUD").then(function (response) {
                return response.json();
            }).then(function (response) {
                return parseFloat(response.AUD);
            });

            value = parseFloat(rate * this.state.selectedNode.netValue);
            currency = "$";
        }

        // create a new object to send back as the updated state for re-render
        const updatedNode = this.state.selectedNode;
        updatedNode.currency = currency;
        updatedNode.netValue = value;

        // set the state
        this.setState({ noNodeSelected: updatedNode });
    };

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
                    <div className="price-hover" onClick={this.onValueClick}>{this.state.selectedNode.currency}{this.state.selectedNode.netValue}</div>
                </div>
            </div>
        )
    }
}
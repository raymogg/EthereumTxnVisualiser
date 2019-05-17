import React, {Component} from 'react';


export default class NodeInfo extends Component {
    state = {}

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

    render() {
      return this.state.selectedNode
          ? this.renderSelectedNode()
          : NodeInfo.renderNoneSelected()
    }

    renderSelectedNode() {
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

    static renderNoneSelected() {
        return (
            <div className="selected-node">
                <div>No Node selected yet</div>
            </div>
        )
    }
}

//<div className="price-hover" onClick={this.onValueClick}>{this.state.selectedNode.currency}{this.state.selectedNode.netValue}</div>

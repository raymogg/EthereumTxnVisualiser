import React, {Component} from 'react';


export default class NodeInfo extends Component {
    state = {}

    componentDidMount() {
        this.props.nodes.sub(selectedNode => {
            this.setState({ selectedNode })
            this.convertCurrency(selectedNode)
        })
        this.props.currencyConversionRate.sub(currencyConversionRate => {
            this.setState({ currencyConversionRate: currencyConversionRate })
        })
        this.props.currency.sub(currency => {
            this.setState({currency: currency})
        })
    }

    convertCurrency(selectedNode) {
        var newNetValue = selectedNode.netValue
        var rate = this.state.currencyConversionRate
        if (this.state.currency === "$") {
            newNetValue = parseFloat(rate * newNetValue);
        }
        this.setState({netValue: newNetValue})
    }

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

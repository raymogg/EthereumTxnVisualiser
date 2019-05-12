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
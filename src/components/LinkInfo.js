import React, {Component} from 'react';


export default class LinkInfo extends Component {
    state = {}

    componentDidMount() {
        this.props.links.sub(selectedLink => {
            this.setState({ selectedLink })
        })
    }

    render() {
        return this.state.selectedLink
            ? this.renderSelectedLink()
            : LinkInfo.renderNoneSelected()
    }

    renderSelectedLink() {
        const { acc1, acc2, acc1Sent, acc2Sent } = this.state.selectedLink
        return (
            <div className="selected-link">
                <h4>{"Link Selected"}</h4>

                <div className="row">
                    <div>Account 1</div>
                    <div>{acc1}</div>
                </div>

                <div className="row">
                    <div>Account 2</div>
                    <div>{acc2}</div>
                </div>

                {LinkInfo.sentMessage("Account 1", acc1Sent)}
                {LinkInfo.sentMessage("Account 2", acc2Sent)}

                <div className="row">
                    <div>Total value of transactions</div>
                    <div>{this.state.selectedLink.totalValue}</div>
                </div>

                <div className="row">
                    <div>Total Number of Transactions</div>
                    <div>{this.state.selectedLink.occurrences}</div>
                </div>

            </div>
        )
    }

    static renderNoneSelected() {
        return (
            <div className="selected-link">
                <div>No link selected yet</div>
            </div>
        )
    }

    static sentMessage(name, value) {
        return (
            <div className="row">
                <div>{name} sent</div>
                <div>{value}</div>
            </div>
        )
    }
}
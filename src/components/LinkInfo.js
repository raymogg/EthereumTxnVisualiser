import React, {Component} from 'react';


export default class LinkInfo extends Component {
    state = {
        currency: "E",
    }

    componentDidMount() {
        this.props.links.sub(selectedLink => {
            this.setState({ selectedLink })
            this.convert_currency(selectedLink)
        })
        this.props.currencyConversionRate.sub(currencyConversionRate => {
            this.setState({ currencyConversionRate: currencyConversionRate })
        })
        this.props.currency.sub(currency => {
            this.setState({currency: currency})
        })
    }

    convert_currency(selectedLink) {
        var newAcc1Sent = selectedLink.acc1Sent
        var newAcc2Sent = selectedLink.acc2Sent
        var newTotalValue = selectedLink.totalValue
        var rate = this.state.currencyConversionRate
        if (this.state.currency === "$") {
            newAcc1Sent = parseFloat(rate * newAcc1Sent);
            newAcc2Sent = parseFloat(rate * newAcc2Sent);
            newTotalValue = parseFloat(rate * newTotalValue);
        }
        this.setState({acc1Sent: newAcc1Sent, acc2Sent: newAcc2Sent, totalValue: newTotalValue})
    }

    render() {
        return this.state.selectedLink
            ? this.renderSelectedLink()
            : LinkInfo.renderNoneSelected()
    }

    renderSelectedLink() {
        const { acc1, acc2 } = this.state.selectedLink
        //acc2Sent = update_currency(this.state.currency, acc2Sent)
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

                {LinkInfo.sentMessage("Account 1", this.state.acc1Sent, this.state.currency)}
                {LinkInfo.sentMessage("Account 2", this.state.acc2Sent, this.state.currency)}

                <div className="row">
                    <div>Total value of transactions</div>
                    <div>({this.state.currency}){this.state.totalValue}</div>
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

    static sentMessage(name, value, currency) {
        return (
            <div className="row">
                <div>{name} sent</div>
                <div>({currency}){value}</div>
            </div>
        )
    }
}

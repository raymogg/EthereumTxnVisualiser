import React, {Component} from 'react';


const noneSelectedInfo = {
    nodeA: "No Node A",
    nodeB: "No Node B",
    aToB: 0,
    bToA: 0,
    numSent: 0
}

export default class LinkInfo extends Component {
    state = {
        selectedLink: noneSelectedInfo,
    }

    componentDidMount() {
        this.props.links.sub(selectedLink => {
            this.setState({ selectedLink })
        })
    }

    render() {
        return (
            <div className="selected-link">
                <h4>{"Link Selected"}</h4>

                <div className="row">
                    <div>Node A ID</div>
                    <div>{this.state.selectedLink.nodeA}</div>
                </div>

                <div className="row">
                    <div>Node B ID</div>
                    <div>{this.state.selectedLink.nodeB}</div>
                </div>

                <div className="row">
                    <div>Amount sent: A to B</div>
                    <div>{this.state.selectedLink.aToB}</div>
                </div>

                <div className="row">
                    <div>Amount sent: B to A</div>
                    <div>{this.state.selectedLink.bToA}</div>
                </div>

                <div className="row">
                    <div>Total Number of Transactions</div>
                    <div>{this.state.selectedLink.numSent}</div>
                </div>
            </div>
        )
    }
}
import React, {Component} from 'react'
import {withSnackbar} from 'notistack'
import Button from "@material-ui/core/Button";

class TransactionBacklog extends Component {
    state = {
        keys: {}
    }

    constructor(props) {
        super(props)
    }

    removeNotification = (address) => {
        const key = this.state.keys[address]
        if (key) {
            this.props.closeSnackbar(key)
        }
    }

    addNotification = (address) => {
        const message = `Backlog on ${address}`
        const key = this.props.enqueueSnackbar(message, {
            autoHideDuration: null,
            action: [
                <Button
                    key="load"
                    color="primary"
                    onClick={() => this.props.loadBacklogHandler(address)}>
                    Load
                </Button>,
                <Button
                    key="close"
                    color="secondary"
                    onClick={() => this.props.backlogDestroyStream.pub(address)}>
                    Close
                </Button>
            ]
        })

        const { keys } = this.state;
        this.setState({
            keys: Object.assign(keys, {[address]: key})
        })
    }

    componentDidMount() {
        this.props.backlogCreatedStream.sub(address => {
            // console.log('backlogCreatedStream.sub:', address)
            this.addNotification(address)
        })
        this.props.backlogDestroyStream.sub(address => {
            this.removeNotification(address)
        })
    }

    render() {
        return (
            <div></div>
        )
    }
}

export default withSnackbar(TransactionBacklog)

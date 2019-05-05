import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import { Graph } from 'react-d3-graph';
import windowSize from 'react-window-size';

const containerStyles = {
    width: '100%',
    height: '80vh',
}

const paperStyle = {
    height: "100vh",
    // marginTop: "5px",
    flex: 1,
    flexDirection: "row",
    width: '100%',
    backgroundColor: "#241e56",
    textAlign: "center",
    color: "white"
};

var myConfig = {
    width: '1000',
    height: '1000',
    nodeHighlightBehavior: true,
    node: {
        color: 'lightgreen',
        size: 120,
        highlightStrokeColor: 'blue'
    },
    link: {
        highlightColor: 'lightblue'
    }
};

class CustomGraph extends Component {
    state = {
        nodeSize: 0,
    };

    setConfig(config) {
        config.node.size = 5000 / this.props.graph.nodes.length;
        config.width = this.props.windowWidth
        config.height = this.props.windowHeight
        return config;
    }

    componentDidMount = async () => {
        //this.setState({graphData: this.props.graph})
        console.log(this.props.graph.nodes)
        console.log(this.props.graph.edges)
    }

    componentDidUpdate = async () => {
        console.log(this.props.graph.nodes)
        console.log(this.props.graph.edges)
    }

    getGraphRender = () => {
        if (!this.props.dataSet) {
            return <h1>No Graph Data Yet </h1>
        } else {
            return (
                <Graph
                    id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
                    data={this.props.graph}
                    config={this.setConfig(myConfig)}
                    style={{ width: '100%!important', height: '100vh!important' }}
										onClickNode={this.props.onClickNode}
                />
            )
        }
    }

    render() {

        return (
            <Paper style={paperStyle}>
                {this.getGraphRender()}
            </Paper>
        )
    }
}

export default windowSize(CustomGraph);

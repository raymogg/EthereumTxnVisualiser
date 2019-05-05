import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import { Graph } from 'react-d3-graph';


const containerStyles = {
    width: '100%',
    height: '80vh',
}

const paperStyle = {
    height: "100%",
    // marginTop: "5px",
    flex: 1,
    flexDirection: "row",
    width: '100%'
};

const myConfig = {
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
    };

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
        if (this.props.graph.nodes == [] && this.props.graph.links == []) {
            return <h1>No Graph Data Yet </h1> 
        } else {
            return (
                <Graph
                    id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
                    data={this.props.graph}
                    config={myConfig}
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

export default (CustomGraph);


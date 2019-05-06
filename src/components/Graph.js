import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import { Graph } from 'react-d3-graph';
import windowSize from 'react-window-size';

const containerStyles = {
    width: '100%',
    height: '80vh',
}


const myConfig = {
    width: '1000',
    height: '1000',
    nodeHighlightBehavior: true,
    node: {
        color: 'lightgreen',
        size: 120,
        highlightStrokeColor: 'blue',
        renderLabel: false,
        svg: 'data:image/jpeg;base64,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'
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
        // console.log(this.props.graph.nodes)
        // console.log(this.props.graph.edges)
    }

    componentDidUpdate = async () => {
        // console.log(this.props.graph.nodes)
        // console.log(this.props.graph.edges)
    }

    getGraphRender = () => {
			if (!this.props.dataSet) {
					return <h1>No Graph Data Yet</h1>
			} else {
					return (
							<Graph
									id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
									data={this.props.graph}
									config={this.setConfig(myConfig)}
									style={{ width: '100%!important', height: '100vh!important' }}
									onMouseOverNode={this.props.onHoverNode}
									onClickNode={this.props.onClickNode}
							/>
					)
			}
    }

    render() {

        return (
            <div>
                {this.getGraphRender()}
            </div>
        )
    }
}

export default windowSize(CustomGraph);

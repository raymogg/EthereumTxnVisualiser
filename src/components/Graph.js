import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import { Graph } from 'react-d3-graph';
import windowSize from 'react-window-size';
import "./AddressEntry.css";

const containerStyles = {
    width: '100%',
    height: '80vh',
}


const myConfig = {
    width: '1000',
    height: '1000',
    nodeHighlightBehavior: true,
    linkHighlightBehavior: true,
    node: {
        color: 'lightgreen',
        highlightStrokeColor: 'blue',
        renderLabel: false
    },
    link: {
        highlightColor: 'lightblue',
        labelProperty: "Hello",
        renderLabel: false
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
					return (
              <div className="landingPage">
                <h1>Ethereum Visualizer</h1>
                <h2>Search an Eth Address and trace its transactions</h2>
              </div>
            );
			} else {
					return (
							<Graph
									id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
									data={this.props.graph}
									config={this.setConfig(myConfig)}
									style={{ width: '100%!important', height: '100vh!important'}}
									onMouseOverNode={this.props.onHoverNode}
									onClickNode={this.props.onClickNode}
                  onClickLink={this.props.onClickLink}
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

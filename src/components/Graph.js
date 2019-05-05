import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import { Sigma, RandomizeNodePositions, RelativeSize } from 'react-sigma';

const myGraph = {
	nodes: [{id: "n1", label: "Alice"}, {id: "n2", label: "Rabbit"}, {id: "n3", label: "Mad Hatter"}],
	edges: [{id: "e1", source: "n1", target: "n2", label: "SEES", size: 1}, {
		id: "e2",
		source: "n1",
		target: "n3",
		label: "SEES",
		size: 1
	},
		{id: "e3", source: "n1", target: "n3", label: "SEES", size: 4}]
};

const containerStyles = {
    width: '100%',
    height: '80vh',
}

const paperStyle = {
    height: "100%",
    // marginTop: "5px",
    flex: 1,
    flexDirection: "row",
    marginLeft: '20px',
    marginRight: '20px',
    marginTop: '20px',
    marginBottom: '20px',
    width: '100%'
};


class Graph extends Component {
		constructor(props) {
			super(props)
			console.log('Graph:constructor:props:', props)
			// this.setState({ graph: props.graph })
		}


    componentDidMount = async () => {
        //const dimensions = this.treeContainer.getBoundingClientRect();
        // this.setState({
        //     translate: {
        //         x: dimensions.width / 2,
        //         y: dimensions.height / 2
        //     }
        // });

        // treeUtil.parseFlatJSON(jsonData).then((data) => {
        //     this.setState({ graphData: data })
        // })
    }

    render() {
			console.log('graph:render:', this.props.graph);

        return (
            <Paper style={paperStyle}>
                <Sigma graph={this.props.graph} settings={{ drawEdges: true, clone: false, minEdgeSize: 1, maxEdgeSize: 5 }}>
                    <RelativeSize initialSize={15} />
                    <RandomizeNodePositions />
                </Sigma>
            </Paper>
        )
    }
}

export default (Graph);


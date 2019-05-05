import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import { Graph } from 'react-d3-graph';

const data = {
    nodes: [{ id: 'Harry' }, { id: 'Sally' }, { id: 'Alice' }],
    links: [{ source: 'Harry', target: 'Sally' }, { source: 'Harry', target: 'Alice', strokeWidth: 5 }]
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

    }

    render() {

        return (
            <Paper style={paperStyle}>
                <Graph
                    id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
                    data={data}
                    config={myConfig}
                />;
            </Paper>
        )
    }
}

export default (CustomGraph);


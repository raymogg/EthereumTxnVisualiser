import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { Sigma, RandomizeNodePositions, RelativeSize } from 'react-sigma'
import {Tree, treeUtil} from 'react-d3-tree';

const myTreeData = [
    {
        name: 'Top Level',
        attributes: {
            keyA: 'val A',
            keyB: 'val B',
            keyC: 'val C',
        },
        children: [
            {
                name: 'Level 2: A',
                attributes: {
                    keyA: 'val A',
                    keyB: 'val B',
                    keyC: 'val C',
                },
            },
            {
                name: 'Level 2: B',
            },
        ],
    },
];

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
    state = {

    };

    componentDidMount = async () => {
        const dimensions = this.treeContainer.getBoundingClientRect();
        this.setState({
            translate: {
                x: dimensions.width / 2,
                y: dimensions.height / 2
            }
        });
    }

    render() {
        return (
            <Paper style={paperStyle}>
                <div style={containerStyles} ref={tc => (this.treeContainer = tc)}>
                    <Tree
                        data={myTreeData}
                        translate={this.state.translate}
                        orientation={'vertical'}
                    />
                </div>
            </Paper>
        )
    }
}

export default (Graph);


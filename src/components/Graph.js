import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
<<<<<<< HEAD
import Tree, { treeUtil } from 'react-d3-tree';
import { Sigma, RandomizeNodePositions, RelativeSize } from 'react-sigma';
const myGraph = {nodes:[{id:"n1", label:"Alice"}, {id:"n2", label:"Rabbit"}, {id:"n3", label:"Mad Hatter"}],
     edges:[{id:"e1",source:"n1",target:"n2",label:"SEES", size: 1}, {id:"e2",source:"n1",target:"n3",label:"SEES", size: 1},
     {id:"e3",source:"n1",target:"n3",label:"SEES", size: 4}]};
=======
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';
import { Sigma, RandomizeNodePositions, RelativeSize } from 'react-sigma'
import {Tree, treeUtil} from 'react-d3-tree';
>>>>>>> df440f301f969d335e3b4c9f49f37f0f54177d93

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

const jsonData = [{ "Parent": "A", "Child": "B" },
{ "Parent": "A", "Child": "B" },
{ "Parent": "B", "Child": "C" }]

const flatData = [["A", "B"],
["A", "B"],
["B", "C"]]



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
        graphData: myTreeData
    };

    componentDidMount = async () => {
<<<<<<< HEAD
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

=======
        const dimensions = this.treeContainer.getBoundingClientRect();
        this.setState({
            translate: {
                x: dimensions.width / 2,
                y: dimensions.height / 2
            }
        });
>>>>>>> df440f301f969d335e3b4c9f49f37f0f54177d93
    }

    render() {
        return (
            <Paper style={paperStyle}>
                <Sigma graph={myGraph} settings={{ drawEdges: true, clone: false, minEdgeSize: 1, maxEdgeSize: 5 }}>
                    <RelativeSize initialSize={15} />
                    <RandomizeNodePositions />
                </Sigma>
            </Paper>
        )
    }
}

export default (Graph);


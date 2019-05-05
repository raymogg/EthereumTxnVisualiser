import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField';

const paperStyle = {
    height: "100%",
    marginTop: "5px",
    flex: 1,
    flexDirection: "row",
    marginLeft: '20px',
    marginRight: '20px',
    marginTop: '20px',
    marginBottom: '20px'
};

class Graph extends Component {
    state = {

    };

    componentDidMount = async () => {

    }

    render() {
        return (
            <Paper style={paperStyle}>
                <Typography> This is a graph </Typography>
            </Paper>
        )
    }
}

export default (Graph);


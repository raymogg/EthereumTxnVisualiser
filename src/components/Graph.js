import React, {Component} from 'react';
import {Graph} from 'react-d3-graph';
import {DotLoader} from 'react-spinners';
import Particles from 'react-particles-js';
import sadFace from "../img/sad.png"

import windowSize from 'react-window-size';
import "./AddressEntry.css";


const containerStyles = {
    width: '100%',
    height: '80vh',
}


const myConfig = {
    //directed: true,
    width: '1000',
    height: '1000',
    nodeHighlightBehavior: true,
    linkHighlightBehavior: true,
    automaticRearrangeAfterDropNode: true,
    //staticGraph: true,
    directed: false,
    d3: {
        gravity: -200,
        linkStrength: 3
    },
    node: {
        highlightStrokeColor: 'blue',
        renderLabel: false,
        //svg: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg'
        //symbolType: 'diamond'
    },
    link: {
        highlightColor: 'lightblue',
        renderLabel: true,
        fontColor: "white",
    }
}


class CustomGraph extends Component {
    state = {
        nodeSize: 0,
    };

    setConfig(config) {
        config.node.size = 5000 / this.props.graph.nodes.length;
        config.directed = this.props.graph.directed
        config.width = this.props.windowWidth
        config.height = this.props.windowHeight
        return config;
    }

    componentDidUpdate = async () => {
      console.log('Graph componentDidUpdate')
    }

    getGraphRender = () => {
        console.log('Graph:getGraphRender: this.props.isLoading =', this.props.isLoading);
        if (this.props.error) {
            return (
                <div className="loader">
                    <img src={sadFace} alt="Uh Oh" style={{width: '50px', height: '50px'}}/>
                    <h2> This account has no transactions </h2>
                </div>
            )
        }
        if (!this.props.dataSet) {
            if (this.props.isLoading === true) {
                return (
                    <div className="loader">
                        <DotLoader
                            sizeUnit={"px"}
                            size={200}
                            color={'lightgreen'}
                            loading={this.props.isLoading}/>
                    </div>
                );
            } else {
                return (
                        <div className="particles">
                            <Particles
                                params={{
                                    "particles": {
                                        "number": {
                                            "value": 130
                                        },
                                        "size": {
                                            "value": 3
                                        },
                                        "color": {
                                          "value": "#90EE90"
                                        }
                                    },
                                    "interactivity": {
                                        "events": {
                                            "onhover": {
                                                "enable": true,
                                                "mode": "grab"
                                            },
                                            "onclick": {
                                                "enable": true,
                                                "node": "push"
                                            }
                                        }
                                    }
                                }}
                                width={this.props.windowWidth}
                                height={this.props.windowHeight}
                                style={{zIndex: 1}}/>
                            <div className="landingPage">
                                <h1>Ethereum Visualizer</h1>
                                <h2>Search an Eth Address and trace its transactions</h2>
                            </div>
                        </div>
                );
            }
        } else {
            return (
                <Graph
                    id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
                    data={this.props.graph}
                    config={this.setConfig(myConfig)}
                    style={{width: '100%!important', height: '100vh!important'}}
                    onMouseOverNode={this.props.onHoverNode}
                    onClickGraph={this.props.onClickGraph}
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

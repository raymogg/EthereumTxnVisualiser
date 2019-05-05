/**
 Javascript to handle the visualisation using Sigma.js
 A transaction is split across 2 Nodes and an Edge.
 @author Lucas Bruck
 **/

// import './mock-data.js';

// API KEY
// FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7

// All transactions
// http://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7


/**
 * Graphnode
 * @param{id}: Integer. The sending node ID
 */
class GraphNode {
    constructor(id) {
        this.id = id;

        this.position = new Point();
    }
}

/**
 * Point
 * The position on the screen of the transaction
 */
class Point {
    constructor() {
        // might not be great logic, but follows guidance from Sigma.js
        this.x = Math.random();
        this.y = Math.random();
    }
}

/**
 * Undirected edge between two transactions. Yes IRL they are directed, but not in a visualisation regard
 * @param{source}: String. The ID of the sending node.
 */
class Edge {
    constructor (source, destination, weight, id) {
        this.source = source;
        this.destination = destination;
        this.weight = weight;
        this.id = id;
    }
}

/**
 * Variables for nodes and edges
 */

// var nodes = [];
// var edges = [];

function processList() {
    // var list = require('./mock-data.js');
    var list = window.data;

    let nodes = list.result.reduce(function(nodes, transaction) {
        nodes[transaction.from] = {
            id: transaction.from,
            label: transaction.from,
            x: Math.random(),
            y: Math.random(),
            size: 1,
            color: "#000"
        };

        nodes[transaction.to] = {
            id: transaction.to,
            label: transaction.to,
            x: Math.random(),
            y: Math.random(),
            size: 1,
            color: "#000"
        };

        return nodes;
    }, {});

    let edges = list.result.reduce(function(edges, transaction) {
        return edges.concat({
            id: transaction.hash,
            source: transaction.from,
            target: transaction.to,
            size: 1,
            color: '#000'
        });
    }, []);

    return [nodes, edges];
}

let [nodes, edges] = processList();

let g = {
    nodes: nodes,
    edges: edges
};

s = new sigma({
    graph: g,
    container: "test"
});
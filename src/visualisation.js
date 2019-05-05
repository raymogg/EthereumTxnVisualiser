import { array } from "prop-types";

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
	constructor(source, destination, weight, id) {
		this.source = source;
		this.destination = destination;
		this.weight = weight;
		this.id = id;
	}
}

function containsEdge(edges, edge) {
	for (var i = 0; i < edges.length; i++) {
		if (edges[i].source == edge.source && edges[i].target == edge.target) {
			return edges[i]
		}
	}

	return null
}


function edgesOfTransactions(transactions) {
	// return transactions.reduce(function (edges, transaction) {
	// 	return edges.concat({
	// 		id: transaction.hash,
	// 		source: transaction.from,
	// 		target: transaction.to,
	// 		size: 1,
	// 		color: '#000'
	// 	});
	// }, [])

	//TODO Weight graph edges by number of transactions between each account
	var edges = []
	for (var i = 0; i < transactions.length; i++) {
		var transaction = transactions[i]
		var edge = {
			id: transaction.hash,
			source: transaction.from,
			target: transaction.to,
			strokeWidth: 1,
			color: '#000'
		}

		//Check if this edge is already in the edges array
		var existentEdge = containsEdge(edges, edge) 
		if (existentEdge != null) {
			existentEdge.strokeWidth += 1
		} else {
			//Otherwise simply add the edge
			edges.push(edge)
		}		
	}
	return edges
}


function nodesOfTransactions(transactions) {
	var nodes = []
	for (var i = 0; i < transactions.length; i++) {
		var transaction = transactions[i]
		if (!nodes.includes(transaction.from)) {
			nodes.push({
				id: transaction.from,
				//TODO any other node data needed for formatting goes here
				// label: transaction.from,
				// // x: Math.random(),
				// // y: Math.random(),
				// size: 1,
				//color: "#000"
			})
		}

		if (!nodes.includes(transaction.to)) {
			nodes.push({
				id: transaction.to,
				//TODO any other node data needed for formatting goes here
				// label: transaction.from,
				// // x: Math.random(),
				// // y: Math.random(),
				// size: 1,
				//color: "#000"
			})
		}
	}

	return nodes;
}


export function processTransactions(transactions) {
	let nodes = nodesOfTransactions(transactions)
	/*
	transactions.reduce(function(nodes, transaction) {
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
	*/

	// let edges = transactions.reduce(function(edges, transaction) {
	//     return edges.concat({
	//         id: transaction.hash,
	//         source: transaction.from,
	//         target: transaction.to,
	//         size: 1,
	//         color: '#000'
	//     });
	// }, []);
	let edges = edgesOfTransactions(transactions)

	return { nodes, edges };
}


/**
 * Accept an existing graph & a list of transactions
 * calculate any nodes or edges that don't exist yet & add them into the graph.
 *
 * NOTE t this will mutate the graph
 *
 * TODO optimise this - it's pretty inefficient.
 */
export function addTransactions(graph, transactions) {
	const { nodes, edges } = graph
	// process nodes:
	// get any 'from' or 'to' addresses from the xactions that are not currently in 'graph'
	// create nodes from the different ones and add them into 'graph.nodes'
	const transactionsWithNewNodes = transactions.filter(t => {
		return !nodes.some(node => node.id !== t.from || node.id !== t.to)
	});
	const newNodes = nodesOfTransactions(transactionsWithNewNodes)

	// process edges:
	// get any diff transaction.hash (s) that are not in 'graph.edges'
	// & add them them into 'graph.edges'
	const transactionsWithNewEdges = transactions.filter(t => {
		return !edges.some(edge => edge.id !== t.hash)
	})
	const newEdges = edgesOfTransactions(transactionsWithNewEdges)

	// Perform the mutations
	// Not yet sure if mutating the existing graph is the right way to go.
	newNodes.forEach(n => graph.nodes.push(n))
	newEdges.forEach(e => graph.edges.push(e))

	return graph
}


// let [nodes, edges] = processList();
//
// let g = {
//     nodes: nodes,
//     edges: edges
// };
//
// s = new sigma({
//     graph: g,
//     container: "test"
// });
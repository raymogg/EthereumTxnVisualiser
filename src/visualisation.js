
// API KEY
// FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7

// All transactions
// http://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7


export function containsNode(nodes, node) {
	for (let existingNode of nodes) {
		if (existingNode.id === node.id) {
			return true
		}
	}
	return false
}


export function containsEdge(edges, edge) {
	for (var i = 0; i < edges.length; i++) {
		if (edges[i].source == edge.source && edges[i].target == edge.target) {
			return edges[i]
		}
	}

	return null
}

function numberToColor(number) {
	if (number < 5) {
		//Dark red
		return "#8e1c05"
	} else if (number < 15) {
		//Red
		return "#ef2c04"
	} else if (number < 30) {
		//Orange
		return "#d8822b"
	} else if (number < 50) {
		//Dark green
		return "#1c6602"
	} else {
		//Green
		return "#40f700"
	}
}


function edgesOfTransactions(transactions) {

	//TODO Weight graph edges by number of transactions between each account
	var edges = []
	for (var i = 0; i < transactions.length; i++) {
		var transaction = transactions[i]
		var edge = {
			id: transaction.hash,
			source: transaction.from,
			target: transaction.to,
			occurences: 1,
			strokeWidth: 1,
			color: numberToColor(1)
		}

		//Check if this edge is already in the edges array
		var existentEdge = containsEdge(edges, edge) 
		if (existentEdge != null) {
			existentEdge.occurences += 1
			if (existentEdge.occurences < 20) {
				existentEdge.strokeWidth += 1
			}
			existentEdge.color = numberToColor(existentEdge.strokeWidth)
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
			})
		}

		if (!nodes.includes(transaction.to)) {
			nodes.push({
				id: transaction.to,
			})
		}
	}

	return nodes;
}


export function processTransactions(transactions) {
	let nodes = nodesOfTransactions(transactions)
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


// API KEY
// FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7

// All transactions
// http://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7


function numberToColor(number) {
	if (number < 5) {
		// blue 6c757d
		return "#007bff";
	} else if (number < 15) {
		// green
		return "#28a745";
	} else if (number < 30) {
		// yellow
		return "#ffc107";
	} else if (number < 50) {
		// red
		return "#dc3545";
	} else {
		// grey
		return "#6c757d";
	}
}

export function colorLinkedNodes(nodeA, nodeB) {
	//TODO: reset the other node colors
	nodeA.color = 'white';
	nodeB.color = 'black';
}

export function toggleLabel(link, text) {
	if (link.label === null) {
		link.label = text;
	} else {
		link.label = null;
	};
}

/**
 * Gets the node correseponding to an id
 *
 *
 */
export function getNode(id, nodes) {
	for (var i = 0; i < nodes.length; i++) {
		if (id === nodes[i].id) {
			return nodes[i]
		}
	}
	return null
}

/**
 * Returns a specific link between a source and a target address
 *
 * @param edges - list of all unique account links
 * @param source - source address
 * @param target - target address
 */
export function containsEdge(edges, edge) {
	for (var i = 0; i < edges.length; i++) {
		if (edges[i].source === edge.source && edges[i].target === edge.target) {
			edges[i].direction = true
			return edges[i]
		}
		//case where the transaction was sent the other direction
		else if (edges[i].source === edge.target && edges[i].target === edge.source) {
			edges[i].direction = false
			return edges[i]
		}
	}
	return null
}


/**
 * Return all unique edges / links between accounts.
 *
 * @param transactions - all known transactions
 * @returns {Array} edges between accounts determined by transactions.
 */
export function uniqueAccountLinks(transactions, scaleByTxnValue) {
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
			color: numberToColor(1),
			//default direction is true source -> target
			direction: true,
			sent: transaction.value / Math.pow(10, 18),
			recv: 0,
			label: null
		}

		//Check if this edge is already in the edges array
		var existentEdge = containsEdge(edges, edge)
		if (existentEdge !== null) {
			//Update the occurences and the total edge value
			existentEdge.occurences += 1
			existentEdge.sent += transaction.value / Math.pow(10, 18)
			//if the direction is unchanged
			if (existentEdge.direction) {
				existentEdge.sent += edge.sent
			} else {
				//this is the case where direction is flipped because
				//the edge was found target -> source
				existentEdge.recv += edge.sent
			}
			if (scaleByTxnValue === false) {
				//Limit edge scaling to a max of 20 transactions between accounts
				if (existentEdge.occurences < 20) {
					existentEdge.strokeWidth += 1
				}
			} else if (scaleByTxnValue === true) {
				//Limit edge scaling to a max of 20ETH worth of value
				if (existentEdge.sent < 20) {
					existentEdge.strokeWidth += (existentEdge.sent / 2)
				}
			}
			existentEdge.color = numberToColor(existentEdge.strokeWidth)
		} else {
			//Otherwise simply add the edge
			//If the edges are being scaled by transaction value make sure to set edge stroke width
			if (scaleByTxnValue === true) {
				var scaledValue = (edge.sent / 2)
				if (scaledValue < 1) {
					scaledValue = 1
				}
				edge.strokeWidth = scaledValue
			}
			edges.push(edge)
		}
	}
	return edges
}

/**
 * Accounts could be in either 'from' or 'to' fields of transactions
 * and as such only count each account once.
 *
 * @param transactions - all known transactions
 * @returns {Array<String>} array of account addresses
 */
export function uniqueAccountAddresses(transactions) {
	const accountAddresses = []
	for (let i = 0; i < transactions.length; i++) {
		const transaction = transactions[i]
		if (!accountAddresses.includes(transaction.from)) {
			accountAddresses.push(transaction.from)
		}
		if (!accountAddresses.includes(transaction.to)) {
			accountAddresses.push(transaction.to)
		}
	}

	// unique addresses with their relative frequencies
	return addressTransactionCount(transactions, accountAddresses);
}

/**
 * For each unique address, sum the number of transactions that they are involved in
 * This determines the size of their node on the screen
 *
 * @param transactions
 * @param addresses
 */
export function addressTransactionCount(transactions, addresses) {
	let addressFrequencies = [];

	addresses.forEach(function (address) {
		let addressCount = 0;

		// updated version of check
		transactions.forEach(function (transaction) {
			if (transaction.to === address || transaction.from === address) {
				addressCount++;
			}
		});

		// for (const transaction in transactions) {
		// 	if (transactions[transaction].from === address || transactions[transaction].to === address) {
		// 		addressCount++;
		// 	}
		// }

		addressFrequencies.push({
			id: address,
			size: addressCount * 50
		});
	});

	return addressFrequencies;
}


/**
 * Equality between transactions can be determined by their hashes.
 *
 * @param transaction1
 * @param transaction2
 * @returns {boolean}
 */
function transactionsEqual(transaction1, transaction2) {
	return transaction1.hash === transaction2.hash
}


/**
 * Check if `transaction` is contained in a list of `transactions`
 *
 * @param transactions
 * @param transaction
 * @returns {*|boolean}
 */
function containsTransaction(transactions, transaction) {
	return transactions.some(txn => transactionsEqual(txn, transaction))
}


/**
 * Given a list of transactions (`transactionsToAdd`) (e.g. could've just been fetched from Etherscan API)
 * add them into the list of existing transactions if and only if they've not already been added.
 *
 * This can be important since we don't want to be processing & visualising duplicate nodes and edges.
 *
 * NOTE: this will mutate the list of existing transactions passed as a param!
 *
 * @param existingTransactions
 * @param transactionsToAdd
 * @returns {*} mutated list of existing transactions where any new one added
 */
export function addNewTransactions(existingTransactions, transactionsToAdd) {
	for (const txn of transactionsToAdd) {
		if (!containsTransaction(existingTransactions, txn)) {
			existingTransactions.push(txn)
		}
	}
	return existingTransactions
}


/**
 * Return all transactions associated with an account.
 * The account could be either sending of receiving ETH.
 *
 * @param accountAddress - the (hash) address of the account of interest
 * @param transactions - all known transactions
 * @returns {*[]}
 */
export function transactionsForAccount(accountAddress, transactions) {
	const transactionsFromAccount = []
	const transactionsToAccount = []

	for (const transaction of transactions) {
		if (transaction.from === accountAddress) {
			transactionsFromAccount.push(transaction)
		} else if (transaction.to === accountAddress) {
			transactionsToAccount.push(transaction)
		}
	}

	return { fromAddress: transactionsFromAccount, toAddress: transactionsToAccount }
	//return transactionsFromAccount.concat(transactionsToAccount) // concat just joins the two lists together
}

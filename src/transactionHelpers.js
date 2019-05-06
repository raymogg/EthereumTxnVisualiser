
// API KEY
// FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7

// All transactions
// http://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7


export function containsEdge(edges, edge) {
	for (var i = 0; i < edges.length; i++) {
		if (edges[i].source === edge.source && edges[i].target === edge.target) {
			return edges[i]
		}
	}
	return null
}


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



/**
 * Return all unique edges / links between accounts.
 *
 * @param transactions - all known transactions
 * @returns {Array} edges between accounts determined by transactions.
 */
export function uniqueAccountLinks(transactions) {
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
		}

		//Check if this edge is already in the edges array
		var existentEdge = containsEdge(edges, edge)
		if (existentEdge !== null) {
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

/**
 * Returns a specific link between a source and a target address
 *
 * @param source - source address
 * @param target - target address
 * @param accountLinks - list of all unique account links
 */
 export function getLink(source, target, accountLinks) {
	 var count = accountLinks.length
	 for(var i = 0; i < count; i++) {
		 var link = accountLinks[i];
		 if (link.source === source && link.target === target) {
			 return link
		 }
	 }
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
	const nodeDetails = addressTransactionCount(transactions, accountAddresses);
	return nodeDetails;
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

	// TODO returning the transactions to and from the account of interest as a
	//  single list - however they could be returned as separate lists.
	//  eg. return { fromAccount: transactionsFromAccount, toAccount: transactionsToAccount }
	return transactionsFromAccount.concat(transactionsToAccount) // concat just joins the two lists together
}

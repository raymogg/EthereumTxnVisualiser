
// API KEY
// FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7

// All transactions
// http://api.etherscan.io/api?module=account&action=txlist&address=0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a&startblock=0&endblock=99999999&sort=asc&apikey=FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7


function numberToColorCount(number) {
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

function numberToColorValue(number) {
	if (number < 1) {
		// blue 6c757d
		return "#007bff";
	} else if (number < 5) {
		// green
		return "#28a745";
	} else if (number < 50) {
		// yellow
		return "#ffc107";
	} else if (number < 100) {
		// red
		return "#dc3545";
	} else {
		// grey
		return "#6c757d";
	}
}

export function highlightLink(link, nodeA, nodeB) {
	//TODO: reset the other node colors
	link.color = 'lightblue'
	nodeA.color = 'lightblue'
	nodeB.color = 'lightblue'
	link.directed = true
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
 * @param edges - list of all unique account transactionsToLinks
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
 * Return all unique edges / transactionsToLinks between accounts.
 *
 * @param transactions - all known transactions
 * @param scaleByTxnValue
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
			occurrences: 1,
			strokeWidth: 1,
			color: numberToColorCount(1),
			//default direction is true source -> target
			direction: true,
			sent: transaction.value / Math.pow(10, 18),
			recv: 0,
			label: null
		}

		//Check if this edge is already in the edges array
		var existentEdge = containsEdge(edges, edge)
		if (existentEdge !== null) {
			//Update the occurrences and the total edge value
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
				if (existentEdge.occurrences < 10) {
					existentEdge.strokeWidth += 1
				}
				existentEdge.color = numberToColorCount(existentEdge.occurrences)
			} else if (scaleByTxnValue === true) {
				//Limit edge scaling to a max of 20ETH worth of value
				if (existentEdge.sent < 10) {
					existentEdge.strokeWidth += (edge.sent / 2)
				}
				
				if (existentEdge.strokeWidth > 10) {
					existentEdge.strokeWidth = 10
				}

				existentEdge.color = numberToColorValue(parseInt(existentEdge.sent) + parseInt(existentEdge.recv))
			}
			//existentEdge.color = numberToColor(existentEdge.strokeWidth)
		} else {
			//Otherwise simply add the edge
			//If the edges are being scaled by transaction value make sure to set edge stroke width
			if (scaleByTxnValue === true) {
				var scaledValue = (edge.sent / 2)
				if (scaledValue < 1) {
					scaledValue = 1
				} else if (scaledValue > 10) {
					scaledValue = 10
				}
				edge.strokeWidth = scaledValue
				edge.color = numberToColorValue(parseInt(edge.sent) + parseInt(edge.recv))
			}
			edges.push(edge)
		}
	}
	return edges
}


/**
 * TODO replace `uniqueAccountLinks` with this.
 *
 * @param edges
 * @param txns
 * @param scaleByValue
 */
export function transactionsToLinks(edges, txns, scaleByValue) {

    function edgeKey(address1, address2) {
        return `${address1}+${address2}`
    }

    function containsEdge(edges, txn) {
        let fromToKey = edgeKey(txn.from, txn.to)
        let toFromKey = edgeKey(txn.to, txn.from)
        if (edges[fromToKey]) {
            return edges[fromToKey]
        } else if (edges[toFromKey]) {
            return edges[toFromKey]
        } else {
            return null
        }
    }

    // edges is key'd by conjoining the 'from' and 'to' account hashes.
    // e.g. `FROM_HASH+TO_HASH`
    // depending on whether we've seen the 'from' or 'to' first / before in previous transactions.
    // Edges `ADDRESS_A+ADDRESS_B` and `ADDRESS_B+ADDRESS_A` are the same, and `containsEdge`
    // should take that into account.
    // TODO remove.
    // const edges = {}

    for (const t of txns) {
        // if the edge exists, get a reference to it and increment the occurrences.
        let edge = containsEdge(edges, t)
        if (edge) {
            edge.occurrences += 1
        } else {
            // This is constructing the default edge object.
            // Note that things such as values & source / target will be changed below.
            // The edge 'key' or 'id' is made up of the 'from' and 'to' account addresses.
            let key = edgeKey(t.from, t.to)
            edges[key] = {
                occurrences: 1,
                acc1: t.from,
                acc2: t.to,
                source: t.from,
                target: t.to,
                acc1Value: 0,
                acc2Value: 0,
                totalValue: 0,
            }
            edge = edges[key]
        }

        // Values
        // * take value away from sender & add to receiver
        const txnValue = parseInt(t.value) / Math.pow(10, 18)
        edge.totalValue += txnValue
        if (t.from === edge.acc1) edge.acc1Value -= txnValue
        if (t.from === edge.acc2) edge.acc2Value -= txnValue
        if (t.to === edge.acc1) edge.acc1Value += txnValue
        if (t.to === edge.acc2) edge.acc2Value += txnValue

        // COLOUR
        // If scaling is being done by occurrences, not value.
        if (scaleByValue === false) {
            edge.color = numberToColorCount(edge.occurrences)
        } else {
            edge.color = numberToColorValue(edge.totalValue)
        }

        // STROKE WIDTH
        // the max value of the stroke width
        // will be 10.
        edge.strokeWidth = Math.min(10, edge.occurrences)

        // SET SOURCE & TARGET
        // * the acc with net loss will be source
        // * acc with net profit will be target
        if (edge.acc1Value > edge.acc2Value) {
            edge.source = edge.acc2
            edge.target = edge.acc1
        } else {
            edge.source = edge.acc1
            edge.target = edge.acc2
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
 *
 * TODO: DEPRECATED - REMOVE THIS
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
 *
 * TODO: DEPRECATED - REMOVE THIS
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

		const newNode = {
			id: address,
			size: getScaledNodeSize(addressCount)
		};

		if (parseInt(newNode.size) >= 110) {
			newNode.color = getNodeColour(parseInt(newNode.size));
		} else {
			newNode.color = "#6c757d";
		}

		addressFrequencies.push(newNode);
	});

	return addressFrequencies;
}


/**
 * For each unique address, sum the number of transactions that they are involved in
 * This determines the size of their node on the screen
 *
 * @return {{size: number, color: (string|string), id: string}[]}
 */
export function accountTransactionsToNodes(accountTxns) {
    return Object.entries(accountTxns).map(([address, transactions]) => {
        const { from, to } = transactions
        const size = getScaledNodeSize(from.size + to.size)
        const color = getNodeColour(size) || "#6c757d" // the 'or' is for the default case.
        return { id: address, size, color }
    })
}


/**
 * Function to scale the nodes with a max value that then takes into account colour
 * @param count
 */
function getScaledNodeSize(count) {
	// block for fairly small transaction counts
	if (count < 10) {
		return 100;
	} else if (count < 20) {
		return 300;
	} else if (count < 30) {
		return 500;
	} else {
		return 700;
	}
}

function getNodeColour(size) {
	if (size < 120) {
		// green
		return "#28a745";
	} else if (size < 140) {
		// blue
        return "#007bff";
	} else if (size < 160) {
		// yellow
        return "#ffc107";
	} else {
		// HUGE and red
        return "#dc3545";
	}
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


export function cacheNewTransactions(existingTxns, transactions) {
    for (const txn of transactions) {
        if (!existingTxns[txn.hash]) {
            existingTxns[txn.hash] = txn
        }
    }
}


/**
 * Return all transactions associated with an account.
 * The account could be either sending of receiving ETH.
 *
 * TODO: DEPRECATED - REMOVE THIS
 *
 * @param accountAddress - the (hash) address of the account of interest
 * @param transactions - all known transactions
 * @returns {{fromAddress: Array, toAddress: Array}}
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
}


export function updateAccountTransactions(accountTransactionsCache, transactions) {
    for (const txn of transactions) {
        // TODO(loughlin) do we need to check for when from/to aren't correct?
        //  or have incorrect txns already been filtered out.
        const {from, to} = txn

        // If accounts not previously seen, set transactions an empty array
        if (!accountTransactionsCache[from]) {
            accountTransactionsCache[from] = {from: new Set(), to: new Set()}
        }
        if (!accountTransactionsCache[to]) {
            accountTransactionsCache[to] = {from: new Set(), to: new Set()}
        }

        accountTransactionsCache[from].from.add(txn.hash)
        accountTransactionsCache[to].to.add(txn.hash)
    }
}



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

/**
 * Returns a specific link between a source and a target address
 *
 * @param edges - list of all unique account updateAccountLinks
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


function linkKey(address1, address2) {
    return `${address1}+${address2}`
}


export function containsLink(links, linkOrTransaction) {
    let source = linkOrTransaction.source || linkOrTransaction.from
    let target = linkOrTransaction.target || linkOrTransaction.to

    let sourceTargetKey = linkKey(source, target)
    let targetSourceKey = linkKey(target, source)
    if (links[sourceTargetKey]) {
        return links[sourceTargetKey]
    } else if (links[targetSourceKey]) {
        return links[targetSourceKey]
    } else {
        return null
    }
}


/**
 * Update the object `edges` which caches all previously established links between accounts.
 *
 * @param edges - the edges cache object.
 * @param newTransactions - list of new transactions (from EtherScan API).
 * @param scaleByValue - scale by total edge transactions value, else by transaction frequency between accounts.
 */
export function updateAccountLinks(edges, newTransactions, scaleByValue) {
    // edges is key'd by conjoining the 'from' and 'to' account hashes.
    // e.g. `FROM_HASH+TO_HASH`
    // depending on whether we've seen the 'from' or 'to' first / before in previous transactions.
    // Edges `ADDRESS_A+ADDRESS_B` and `ADDRESS_B+ADDRESS_A` are the same, and `containsLink`
    // should take that into account.
    // TODO remove.
    // const edges = {}

    for (const t of newTransactions) {
        // if the edge exists, get a reference to it and increment the occurrences.
        let edge = containsLink(edges, t)
        if (edge) {
            edge.occurrences += 1
        } else {
            // This is constructing the default edge object.
            // Note that things such as values & source / target will be changed below.
            // The edge 'key' or 'id' is made up of the 'from' and 'to' account addresses.
            let key = linkKey(t.from, t.to)
            edges[key] = {
                occurrences: 1,
                acc1: t.from,
                acc2: t.to,
                source: t.from,
                target: t.to,
                acc1Value: 0,
								acc2Value: 0,
								acc1Sent: 0,
								acc2Sent: 0,
								acc1Recv: 0,
								acc2Recv: 0,
                totalValue: 0,
								currency: "E",
            }
            edge = edges[key]
        }

        // Values
        // * take value away from sender & add to receiver
        const txnValue = parseInt(t.value) / Math.pow(10, 18)
        edge.totalValue += txnValue
        if (t.from === edge.acc1) {
			edge.acc1Value -= txnValue
			edge.acc2Value += txnValue
			edge.acc1Sent += txnValue
			edge.acc2Recv += txnValue
		}
        if (t.from === edge.acc2) {
			edge.acc2Value -= txnValue
			edge.acc1Value += txnValue
			edge.acc2Sent += txnValue
			edge.acc1Recv += txnValue
		}

        // StrokeWidth and Colour scaling
        // If scaling is being done by occurrences, not value.
        if (scaleByValue === false) {
			edge.color = numberToColorCount(edge.occurrences)
            // the max value of the stroke width will be 10.
			edge.strokeWidth = Math.min(10, edge.occurrences)
        } else {
			edge.color = numberToColorValue(edge.totalValue)
            // the max value of the stroke width will be 10.
			edge.strokeWidth = Math.min(10, edge.totalValue)
		}

		//Ensure edge width is at least one so you can see it
		if (edge.strokeWidth < 1) {
			edge.strokeWidth = 1
		}

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
 * Given a list of newTransactions (`newTransactions`) (e.g. could've just been fetched from Etherscan API)
 * add them into the map/object of existing newTransactions if and only if they've not already been added.
 *
 * This can be important since we don't want to be processing & visualising duplicate nodes and edges.
 *
 * NOTE: this will mutate the map/object of existing newTransactions passed as a param!
 *
 * @param {Object} existingTransactions
 * @param {[Object]} newTransactions
 * @returns {*} object mapping: transaction hash => transaction
 */
export function updateTransactions(existingTransactions, newTransactions) {
    for (const txn of newTransactions) {
        if (!existingTransactions[txn.hash]) {
            existingTransactions[txn.hash] = txn
        }
    }
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

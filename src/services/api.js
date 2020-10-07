import {IterStream} from "../stream";

const API_KEY = process.env.API_KEY || `FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7`


function removeTransactionsWithInvalidAddresses(transactions) {
	const validTransactions = []
	for (const transaction of transactions) {
		// added check for broken records with no address defined
		if (typeof transaction.from === "undefined" || typeof transaction.to === "undefined"
			|| transaction.from.length < 1 || transaction.to.length < 1) {
			console.warn("Removed transaction with invalid 'from' or 'to' address", transaction);
		} else {
			validTransactions.push(transaction)
		}
	}
	return validTransactions
}


export function fetchTransactions(address, network) {
    // if (network === 'testnet') console.log('Fetching testnet transactions')
    // else console.log('Fetching mainnet transactions');

    const url = network === 'testnet'
        ? 'https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY
        : 'https://api.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY

    return fetch(url)
        .then(response => response.json())
        .then(data => data.result)
        .then(transactions => removeTransactionsWithInvalidAddresses(transactions))
}


export function fetchERC20Transactions(address, tokenAddress) {
	console.log("Getting mainnet ERC20 transactions. tokenAddress =", tokenAddress)

    const url = 'https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=' +
        tokenAddress +
        '&address=' +
        address +
        '&startblock=0&endblock=99999999&sort=asc&apikey=' +
        API_KEY

	return fetch(url)
		.then(response => response.json())
		.then(data => data.result)
		.then(transactions => removeTransactionsWithInvalidAddresses(transactions))
}


export function fetchERC20TransactionsIter(address, tokenAddress) {
    return fetchERC20Transactions(address, tokenAddress).then(txns => {
        return IterStream(txns)
    })
}


export function fetchTxnIterable(address, network) {
    return fetchTransactions(address, network).then(transactions => {
        return IterStream(transactions)
    })
}

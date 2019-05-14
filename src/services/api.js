import {IterStream} from "../stream";

const API_KEY = `FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7`;


function removeTransactionsWithInvalidAddresses(transactions) {
	const validTransactions = []
	for (const transaction of transactions) {
		if (transaction.from.length < 1 || transaction.to.length < 1) {
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
        ? 'http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY
        : 'http://api.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY

    return fetch(url)
        .then(response => response.json())
        .then(data => data.result)
        .then(transactions => removeTransactionsWithInvalidAddresses(transactions))
}


export function fetchERC20Transactions(address, tokenAddress) {
	console.log("Getting mainnet ERC20 transactions. tokenAddress =", tokenAddress)

    const url = 'http://api.etherscan.io/api?module=account&action=tokentx&contractaddress=' +
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


export function fetchTxnIterable(address, network) {
    return fetchTransactions(address, network).then(transactions => {
        return IterStream(transactions)
    })
}
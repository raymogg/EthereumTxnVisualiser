
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
	if (network === "testnet") {
		console.log("Getting testnet transactions")
		return fetch('http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY)
			.then(function (response) {
				return response.json();
			})
			//Handling data here
			.then(function (data) {
				return data.result;
			})
			.then(function (transactions) {
				return removeTransactionsWithInvalidAddresses(transactions)
			})
	} else {
		console.log("Getting mainnet transactions")
		return fetch('http://api.etherscan.io/api?module=account&action=txlist&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY)
			.then(function (response) {
				return response.json();
			})
			//Handling data here
			.then(function (data) {
				return data.result;
			})
			.then(function (transactions) {
				return removeTransactionsWithInvalidAddresses(transactions)
			})
	}
}

export function fetchERC20Transactions(address, tokenAddress) {
	console.log("Getting mainnet ERC20 transactions")
	console.log(tokenAddress)
	return fetch('http://api.etherscan.io/api?module=account&action=tokentx&contractaddress=' + tokenAddress +
		'&address=' + address + '&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY)
		.then(function (response) {
			console.log(response)
			return response.json();
		})
		//Handling data here
		.then(function (data) {
			console.log(data)
			return data.result;
		})
		.then(function (transactions) {
			console.log(transactions)
			return removeTransactionsWithInvalidAddresses(transactions)
		})
}

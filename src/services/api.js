
const API_KEY = `FNSRA72PPZD837EAM6N6Q3ZU2EUKRYGPQ7`;


export function fetchTransactions(address) {
	return fetch('http://api.etherscan.io/api?module=account&action=txlist&address=' + address +'&startblock=0&endblock=99999999&sort=asc&apikey=' + API_KEY)
		.then(function(response) {
			return response.json();
		})
		//Handling data here
		.then(function(data) {
			return data.result;

			// var send = [];
			// var receive = [];
			// var jsonData = {};
			// var resultLength = data.result.length;
			// for (var i = 0; i < resultLength; i++) {
			// 	if(data.result[i].from == ADDRESS) {
			// 		send.push()
			// 	}
			// 	if(data.result[i].to == ADDRESS) {
			// 		console.log("receiving");
			// 	}
			//     console.log(data.result[i]);
			//     //Do something
			// }
			// console.log(data);
		});
}

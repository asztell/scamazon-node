var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "1MysqlPass!",
	database: "Scamazon"
});

connection.connect(function(err) {
	if (err) throw err;
	start();
});


function start() {

	var query = 'SELECT ItemID, ProductName, DepartmentName, Price, StockQuantity FROM Products';

	connection.query(query, function(err, res) {

		for (var i = 0; i < res.length; i++) {
			console.log(
						  "ItemID: "			+ res[i].ItemID
					+ " || ProductName: " 		+ res[i].ProductName
					// + " || DepartmentName: " 	+ res[i].DepartmentName
					+ " || Price: $" 			+ res[i].Price
					// + " || StockQuantity: " 	+ res[i].StockQuantity
					);
		}

		buy();

	});

}


function buy() {

	inquirer.prompt([

		{
			name: "id",
			type: "input",
			message: "What product would you like to buy? Please enter ItemID: "
		},
		{
			name: "quantity",
			type: "input",
			message: "Please indicate quantity to be purchased: "
		}

	]).then(function(answer) {

		connection.query('SELECT StockQuantity, ProductName, Price FROM Products WHERE ?', {ItemID: answer.id}, function(err, res) {

			if(res[0].StockQuantity <= answer.quantity) {
				console.log('Insufficient quantity!');
			} else {
				console.log('You have purchased '+answer.quantity+' items called '+res[0].ProductName);
				console.log('Your total for this purchase is $'+res[0].Price*answer.quantity);

				var difference = res[0].StockQuantity-answer.quantity;
				connection.query('UPDATE Products SET StockQuantity = '+difference.toString()+' WHERE ?', {ItemID: answer.id}, function(e, r){});

				continueShopping();
			}
	
		});
	
	});

	
	function continueShopping() {
	
		inquirer.prompt(
			{
				name: 'continue',
				type: 'input',
				message: 'Continue shopping? (y/n) '
			}

		).then(function(answer) {
		
			if(answer.continue == 'y') {
				buy();
			} else {
				return;
			}
		
		});
	
	}

}
var inquirer = require('inquirer');


//-----------------------------------------------------------------------------
// mysql module code
//-----------------------------------------------------------------------------

var mysql = require('mysql');

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


//-----------------------------------------------------------------------------
// cli-table module code
//-----------------------------------------------------------------------------

var Table = require('cli-table');

var ProductsTable = new Table({
    head: ['ID', 'Product', 'Department', 'Price', 'Stock', 'Default']
  , colWidths: [4, 70, 13, 7, 7, 9]
  , style: { 'padding-right': 0 }
  , colAligns: []
});


//-----------------------------------------------------------------------------
// start function code
//-----------------------------------------------------------------------------

function start() {

	inquirer.prompt({
		name: 'manager_menu_choice',
		type: 'list',
		message: 'Options: ',
		choices: [
			'View Products for Sale',
			'View Low Inventory',
			new inquirer.Separator(),
			'Add to Inventory',
			'Add New Product',
			'Quit'
		]
	}).then(function(answer) {

		switch(answer.manager_menu_choice) {
			case 'View Products for Sale':
				viewInventory();
				break;
			case 'View Low Inventory':
				viewLowInventory();
				break;
			case 'Add to Inventory':
				addToInventory();
				break;
			case 'Add New Product':
				addNewProduct();
				break;
			case 'Quit':
				process.exit();
				break;
		}

	});

}


//-----------------------------------------------------------------------------
// viewInventory function code
//-----------------------------------------------------------------------------

function viewInventory() {

	var query = 'SELECT ItemID, ProductName, DepartmentName, Price, StockQuantity, DefaultQuantity FROM Products';

	connection.query(query, function(err, res) {

		for (var i = 0; i < res.length; i++) {

			ProductsTable.push([
				res[i].ItemID,
				res[i].ProductName,
				res[i].DepartmentName,
				res[i].Price,
				res[i].StockQuantity,
				res[i].DefaultQuantity
			]);

		}

		console.log(ProductsTable.toString());

		ProductsTable.length = 0;

		start();

	});

}


function addToInventory() {

	inquirer.prompt([

		{
			name: "id",
			type: "input",
			message: "What product(s) would you like to update? Please enter ItemID(s): "
		}

	]).then(function(answer) {

		connection.query('SELECT StockQuantity, ProductName, DefaultQuantity FROM Products WHERE ?', {ItemID: answer.id}, function(err, res) {

			if(res[0].StockQuantity < res[0].DefaultQuantity) {

				connection.query('UPDATE Products SET StockQuantity = '+res[0].DefaultQuantity+' WHERE ?', {ItemID: answer.id}, function(e, r){});

				console.log('Update successful!');

				connection.query('SELECT * FROM Products WHERE ?', {ItemID: answer.id}, function(e, r){
					console.log('Quantity of '+res[0].ItemID+' = '+r[0].StockQuantity);
				});

			} else {
				console.log('This item is fully stocked!');
			}

			start();

		});

	});

}


function viewLowInventory() {

	connection.query('SELECT ItemID, StockQuantity, ProductName, DefaultQuantity, Price, DepartmentName FROM Products WHERE StockQuantity >= 200', function(err, res) {

		for (var i = 0; i < res.length; i++) {

			ProductsTable.push([
				res[i].ItemID,
				res[i].ProductName,
				res[i].DepartmentName,
				res[i].Price,
				res[i].StockQuantity,
				res[i].DefaultQuantity
			]);

		}

		console.log(ProductsTable.toString());

		start();

	});

}


function addNewProduct() {

}
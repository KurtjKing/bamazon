
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var table = new Table({
  head: ['Item ID', 'Item', 'Price', 'Qnty'],
  colWidths: [20, 40, 15, 15]
});


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "kurtjking",
    password: "Skateboard6",
    database: "bamazonDB"
  });

  connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
  });

  startBamazon();

//Displays products in database table
function startBamazon() {
    connection.query('SELECT * FROM Products', function (err, res) {
      // Display products and price to user. Push the recordset from the DB 
      for (var i = 0; i < res.length; i++) {
        table.push([res[i].item_id, res[i].product_name, res[i].price.toFixed(2), res[i].stock_quantity])
      }
      console.log(table.toString());
  
      // Ask user questions for purchase 
      inquirer.prompt([{
        // Ask user to choose a product to purchase
        name: "choice",
        type: "list",
        message: "What would you like to purchase?",
        
        choices: function (value) {
          var selectArray = [];
          for (var i = 0; i < res.length; i++) {
            selectArray.push(res[i].product_name);
          }
          return selectArray;
        }
      }, {
        // Ask user to enter a quantity to purchase
        name: "quantity",
        type: "input",
        message: "How many would you like to buy?",
        validate: function (value) {
          if (isNaN(value) == false) {
            return true;
          } else {
            return false;
          }
        }
      }]).then(function (answer) {
        for (var i = 0; i < res.length; i++) {
          if (res[i].product_name == answer.choice) {
            var selectedItem = res[i];
          }
        }
        // remaining stock
        var updateStock = parseInt(selectedItem.stock_quantity) - parseInt(answer.quantity);
        var pSales = parseFloat(selectedItem.product_sales).toFixed(2);
       
        // If customer wants to purchase more than available in stock, user will be asked if he wants to make another purchase
        if (selectedItem.stock_quantity < parseInt(answer.quantity)) {
          console.log("Insufficient quantity");
          repeat();
        }
        // If the customer wants to purchase an amount that is in stock, the remaining stock quantity will be updated in the database and the price presented to the customer
        else {
            var Total = (parseFloat(answer.quantity) * selectedItem.price).toFixed(2);

            console.log("successful");
            console.log("Your total is $ " + Total);
            repeat();
        }
  
      }); 
  
    }); 
  
  } 
  
 
  function repeat() {
    inquirer.prompt({
      // Ask user if he wants to purchase another item
      name: "repurchase",
      type: "list",
      choices: ["Yes", "No"],
      message: "Would you like to pick another item?"
    }).then(function (answer) {
      if (answer.repurchase == "Yes") {
        startBamazon();
      }
      else {
        console.log(" Thanks!!");
        connection.end();
      }
    });
  }

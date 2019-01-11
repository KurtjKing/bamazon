
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var table = new Table({
  head: ['Item ID', 'Item', 'Department', 'Price', 'Qnty'],
  colWidths: [20, 40, 35, 15, 15]
});
var depart = [];



//Connection to DB
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


runStore();

function runStore() {
  inquirer.prompt([{
    name: "mainMenu",
    type: "list",
    message: "Hello, Please choose an option",
    choices: [
      "View Products for Sale",
      "View Low Inventory",
      new inquirer.Separator(),
      "Add to Inventory",
      "Add New Product"]

  }]).then(function (resp) {
      switch (resp.mainMenu) {
      case "View Products for Sale":
        viewProducts();
        break;

      case "View Low Inventory":
        viewLow();
        break;

      case "Add to Inventory":
        addInv();                  
        break;

      case "Add New Product":
        addProd();   
        break;
    }
  })
}


function viewProducts() {
  connection.query('SELECT * FROM Products', function (err, res) {
    
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
    }
    console.log(table.toString());
    connection.close;
    repeat();
  })
};

function viewLow() {
  connection.query("SELECT * FROM products where stock_quantity < 5", function (err, res) {
   
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
    }
    console.log(table.toString());
    connection.close;
    repeat();
  })
};

function addInv() {
  inquirer.prompt([{
    name: "item_id",
    type: "input",
    message: "Enter the product_id.",
    validate: function (value) {
      if (isNaN(value) == false) {
        return true;
      } else {
        return false;
      }
    }
  },
  {
    name: "updateStock",
    type: "input",
    message: "Enter the amount that you want to add to stock.",
    validate: function (value) {
      if (isNaN(value) == false) {
        return true;
      } else {
        return false;
      }
    }
  }]).then(function (answer) {
    console.log(`Qty ${answer.updateStock} ID: ${answer.item_id}`);
    connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          stock_quantity: answer.updateStock
        },
        {
          item_id: answer.item_id
        }

      ]
    )
    console.log( "Inventory has been updated!\n");
    repeat();
  })
};
function addProd() {
  connection.query("SELECT department_name FROM departments", function (err, res) {
    if (err) throw err;
    
    for (var i = 0; i < res.length; i++) {
      deptart.push(res[i].department_name);
    }
    
    connection.close;
  })


  inquirer.prompt([
    {
      name: "item",
      type: "input",
      message: "Enter the name of the product to add to the inventory.",
      validate: function (value) {
        if (value == null || value == "") {
          return false;
        } else {
          return true;
        }
      }
    },
    {
      name: "department",
      type: "list",
      choices: depart,
      message: "Select the department for the new product."
    },
    {
      name: "price",
      type: "input",
      message: "Enter an the price for a single new product.",
      validate: function (value) {
        if (value == null || value == "") {
          return false;
        } else {
          return true;
        }
      }
    },
    {
      name: "qnty",
      type: "input",
      message: "Enter the amount of products to put in stock.",
      validate: function (value) {
        if (value == null || value == "") {
          return false;
        } else {
          return true;
        }
      }
    },
    {
      name: "sales",
      type: "input",
      message: "Enter the amount of product sales for this product.",
      validate: function (value) {
        if (value == null || value == "") {
          return false;
        } else {
          return true;
        }
      }
    }
  ]).then(function (answers) {
    

    var query = connection.query(
      "INSERT INTO products SET ?",
      {
        product_name: answers.item,
        department_name: answers.department,
        price: answers.price,
        stock_quantity: answers.qnty,
        product_sales: answers.sales
      },
      function (err, res) {
        if (err) throw err;
        console.log(res.affectedRows +  "  Product placed!\n");
        connection.end;
        repeat();
      }
    );

  });

}


function repeat() {
  inquirer.prompt({
    name: "manage",
    type: "list",
    choices: ["Yes", "No"],
    message: "Would you like to continue?"
  }).then(function (answer) {
    if (answer.manage == "Yes") {
      runStore();
    }
    else {
      console.log( "Thanks")
      connection.end();
    }
  });
}
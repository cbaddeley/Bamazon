const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const {table} = require('table');
var uniqueIdsForPrompt = [];
var idOfStock;
var departmentArray = [];
var uniqueArray = [];

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

function viewProducts(results) {
  var departmentArray = [];
  for (var i = 0; i < results.length; i++) {
    departmentArray.push(results[i].department_name);
  }
  //This is a function that gets rid of duplicates
  var uniqueArray = departmentArray.filter(function(elem, pos) {
    return departmentArray.indexOf(elem) == pos;
  });
  //So now this for loop goes through all the results and makes a list of items for sale.
  for (var j = 0; j < uniqueArray.length; j++) {
    //The following is a lot of table npm stuff. Later in another for loop I create a new array for each item and push it to this data array
    let config,
    data,
    output;
    data = [
    ['ID#', 'Name', 'Price', 'Quantity']
    ];
    config = {
      border: {
          topBody: `─`,
          topJoin: `┬`,
          topLeft: `┌`,
          topRight: `┐`,

          bottomBody: `─`,
          bottomJoin: `┴`,
          bottomLeft: `└`,
          bottomRight: `┘`,

          bodyLeft: `│`,
          bodyRight: `│`,
          bodyJoin: `│`,

          joinBody: `─`,
          joinLeft: `├`,
          joinRight: `┤`,
          joinJoin: `┼`
      }
    };
    console.log("");
    console.log("----------" + uniqueArray[j] + "----------");
    console.log("");
    //You need to make a new array to push into the data since the table npm uses a 2d array for formatting a table in the terminal
    for (var m = 0; m < results.length; m++) {
      if (results[m].department_name == uniqueArray[j]) {
        var tableInput = new Array;
        uniqueIdsForPrompt.push(results[m].id);
        tableInput.push(results[m].id.toString());
        tableInput.push(results[m].product_name);
        tableInput.push(results[m].price.toFixed(2).toString());
        tableInput.push(results[m].stock_quantity.toString());
        data.push(tableInput);
      }
    }
    //uses the table npm to make a table of all items in the current department
    output = table(data, config);
    console.log(output);
  }
  prompt();
}

function addInv(results) {
  inquirer
    .prompt([
      {
        name: "idOfStock",
        type: "input",
        message: "Please type in the ID# of the product whose stock you would to replenish.",
        validate: function(value) {
          if (value == 'cancel') {
            connection.destroy();
            process.exit(0);
          }
          var validId = false;
          for (var i = 0; i < results.length; i ++) {
            if (value == results[i].id) {
              validId = true;
            }
          }
          if (isNaN(value) === false && validId === true) {
            return true;
          }
          console.log("\nWe're sorry that is not a valid ID#. Please choose a valid ID# or type 'cancel' to leave this application.");
          return false;
        }
      }
    ]).then(function(answer) {
      idOfStock = parseInt(answer.idOfStock) - 1;
      console.log("");
      console.log(chalk.bold("You have chosen: ") + chalk.blue(results[idOfStock].product_name));
      console.log("");
      inquirer
        .prompt({
          name: "numOfStock",
          type: "input",
          message: "Please type the amount you would like to add.",
          validate: function(value) {
            if (value == 'cancel') {
              connection.destroy();
              process.exit(0);
            }
            if (isNaN(value) === false && value > 0) {
              return true;
            }
            console.log("\nPlease choose a valid amount or type 'cancel' to leave this application.");
            return false;
          }
        })
        .then(function(answer) {
            var newNumberOfStock = parseInt(results[idOfStock].stock_quantity) + parseInt(answer.numOfStock);
            var temp = idOfStock+1;
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: newNumberOfStock
                },
                {
                  id: temp
                }
              ],
              function(error) {
                if (error) throw err;
                console.log(chalk.green("Items successfully added."));
                console.log(chalk.green("New stock count of " + results[idOfStock].product_name + " is " + newNumberOfStock + "."));
                prompt();
            });
        });
    });
}

function addNew(results) {


  inquirer.prompt([

    {
      name: "name",
      type: "input",
      message: "Type in the name of the new product.",
    },

    {
      type: "list",
      name: "department",
      message: "Type in the department",
      choices: uniqueArray
      },

    {
      type: "name",
      name: "price",
      message: "Type in cost of item"
    },
    {
      type: "name",
      name: "stock",
      message: "Initial Stock."
    }
  ]).then(function(resp) {
    connection.query(
      "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + resp.name + "','" + resp.department + "'," + resp.price+ "," + resp.stock+")",
      function(error) {
        if (error) throw error;
        console.log(chalk.green("Item successfully added."));
        prompt();
      });
  });
}
        // name: "name",
        // type: "input",
        // message: "Type in the name of the new product.",
        // validate: function(value) {
        //   if (value == 'cancel') {
        //     connection.destroy();
        //     process.exit(0);
        //   }
        //   var confirm = false;
        //   for (var i = 0; i < results.length; i ++) {
        //     if (value == results[i].product_name) {



function prompt() {
    inquirer
      .prompt({
        name: "managerOptions",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
      })
      .then(function(answer) {
        switch (answer.managerOptions) {
          case "View Products for Sale":
          connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            viewProducts(res);
            });
            break;

          case "View Low Inventory":
          connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
            if (err) throw err;
            if (res.toString() == "") {
                console.log(chalk.bold.red("There are currently no items with low inventory."));
                prompt();
            } else {
              viewProducts(res);
            }
            });
            break;

          case "Add to Inventory":
          connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            addInv(res);
            });
            break;

          case "Add New Product":
          connection.query("SELECT * FROM departments", function(err, res) {
            if (err) throw err;
            getDepartArr(res);
            connection.query("SELECT * FROM products", function(err, res) {
              if (err) throw err;
              addNew(res);
              });
            });
            break;

          case "Exit":
            connection.end();
            process.exit(0);
            break;
        }
      });

}

connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  prompt();
});

function getDepartArr (results) {
  for (var i = 0; i < results.length; i++) {
    departmentArray.push(results[i].department_name);
  }
  //This is a function that gets rid of duplicates
  uniqueArray = departmentArray.filter(function(elem, pos) {
    return departmentArray.indexOf(elem) == pos;
  });
}

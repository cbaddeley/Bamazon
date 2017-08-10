const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const {table} = require('table');
var uniqueIdsForPrompt = [];
var quantityOfCurrentItem;
var nameOfCurrentItem;
var priceOfCurrentItem;
var idOfCurrentItem;
var numPurchasing;
var currentTotalSales;

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

//establishing a connection
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    displayItems(res);
    start();
  });
});

function displayItems(results) {
  //This for loop takes all the departments and makes an array. It's just for formatting purposes and making things look good
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
    ['ID#', 'Name', 'Price']
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
        data.push(tableInput);
      }
    }
    //uses the table npm to make a table of all items in the current department
    output = table(data, config);
    console.log(output);
  }
}

function start(){
  inquirer
    .prompt({
      name: "purchaseOption",
      type: "list",
      message: "Would you like to make a purchase?",
      choices: ["Yes", "No"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.purchaseOption === "Yes") {
        inquirer
          .prompt([
            {
              name: "itemId",
              type: "input",
              message: "Please type in the item ID number.",
              validate: function(value) {
                if (value == 'cancel') {
                  connection.destroy();
                  process.exit(0);
                }
                var isFound = false;
                for (var i = 0; i < uniqueIdsForPrompt.length; i++) {
                  if (uniqueIdsForPrompt[i] == value) {
                    isFound = true;
                  }
                }
                if (isNaN(value) === false && isFound === true) {
                  return true;
                }
                console.log("\nPlease enter a correct ID number or type 'cancel' to leave this application.");
                return false;
              }
            }
            //I'm breaking this up so i can get the quantity of the id
          ]).then(function(answer) {
            connection.query("SELECT * FROM products WHERE id=?", [answer.itemId], function(err, res) {
              //setting the results to some global vars so i can call them later
              quantityOfCurrentItem = res[0].stock_quantity;
              nameOfCurrentItem = res[0].product_name;
              priceOfCurrentItem = res[0].price;
              idOfCurrentItem = res[0].id;
              currentTotalSales = res[0].product_sales;
              quantity();
            });
          });
      }
      else {
        connection.destroy();
        return false;
      }
    });
}

//this takes the number available and compares it to the amount the user wants
function quantity() {
  inquirer
    .prompt([
      {
        name: "itemQuantity",
        type: "input",
        message: "Please type in the number of " + nameOfCurrentItem + " you would like to purchase.",
        validate: function(value) {
          if (value == 'cancel') {
            connection.destroy();
            process.exit(0);
          }
          var stockAvailable = false;
          if (value < quantityOfCurrentItem) {
            stockAvailable = true;
          }
          if (isNaN(value) === false && value > 0 && stockAvailable === true) {
            return true;
          }
          console.log("\nWe're sorry there are only " + quantityOfCurrentItem + " " + nameOfCurrentItem + " left in stock. Please choose a diffrent number or type 'cancel' to leave this application.");
          return false;
        }
      }
      //prompts the user to check whether they want to purchase or not
    ]).then(function(answer) {
      numPurchasing = answer.itemQuantity;
      var totalToAddToSales = parseFloat((answer.itemQuantity * priceOfCurrentItem));
      console.log("");
      console.log(chalk.bold("Your total is: ") + chalk.blue(totalToAddToSales));
      console.log("");
      inquirer
        .prompt({
          name: "purchase",
          type: "list",
          message: "Would you like to make this purchase?",
          choices: ["Yes", "No"]
        })
        .then(function(answer) {
          var newQuantity = parseInt(quantityOfCurrentItem - numPurchasing);
          if (answer.purchase === "Yes") {
            //updates database
            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: newQuantity,
                  product_sales: (currentTotalSales + totalToAddToSales)
                },
                {
                  id: idOfCurrentItem
                }
              ],
              function(error) {
                if (error) throw err;
                console.log(chalk.green("Items successfully purchased."));
                inquirer
                  .prompt({
                    name: "goAgain",
                    type: "list",
                    message: "Shop some more?",
                    choices: ["Yes", "No"]
                  })
                  .then(function(answer) {
                    if (answer.goAgain == "Yes") {
                      start();
                    } else {
                      connection.end();
                    }
                  });
              });
          } else {
            console.log(chalk.red("Transaction cancelled."));
            connection.end();
          }
        });
    });
}

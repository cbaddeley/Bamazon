const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const {table} = require('table');
var departmentArray = [];
var uniqueArray = [];
var salesAdded;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

function prompt() {
    inquirer
      .prompt({
        name: "supervisorOptions",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Product Sales by Department", "Create New Department", "Exit"]
      })
      .then(function(answer) {
        switch (answer.supervisorOptions) {
          case "View Product Sales by Department":
          connection.query("SELECT department_name FROM departments", function(err, res) {
            if (err) throw err;
            viewProductSales(res);
            });
            break;

          case "Create New Department":
            newDepart();
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

function viewProductSales(results) {
  getDepartArr(results);
  inquirer.prompt([
    {
      type: "list",
      name: "department",
      message: "Select the department",
      choices: uniqueArray
      }
  ]).then(function(resp) {
    addUpSales(resp.department);
  });
}

function newDepart() {
  inquirer.prompt([

    {
      name: "name",
      type: "input",
      message: "Type in the name of the new department.",
    },

    {
      type: "name",
      name: "overhead",
      message: "What is the overhead cost amount?"
    }
  ]).then(function(resp) {
    connection.query(
      "INSERT INTO departments (department_name, over_head_costs) VALUES ('" + resp.name + "'," + resp.overhead +")",
      function(error) {
        if (error) throw error;
        console.log(chalk.green("Department successfully added."));
        prompt();
      });
  });
}

function getDepartArr (results) {
  for (var i = 0; i < results.length; i++) {
    departmentArray.push(results[i].department_name);
  }
  //This is a function that gets rid of duplicates
  uniqueArray = departmentArray.filter(function(elem, pos) {
    return departmentArray.indexOf(elem) == pos;
  });
}

function addUpSales(department) {
  connection.query(
    "SELECT product_sales FROM products WHERE ?",
    [
      {
        department_name: department
      }
    ],
    function(error, resp) {
      if (error) throw err;
      salesAdded = 0;
      for (var i = 0; i < resp.length; i++) {
          salesAdded += resp[i].product_sales;
      }
  });
  displayTable(department);
}

function displayTable(department) {
  connection.query("SELECT * FROM departments WHERE ?",
  [
    {
      department_name: department
    }
  ],
  function(error,resp) {
    let config,
    data,
    output;
    data = [
    ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales', 'Total Profit']
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
    var tableInput = new Array;
    tableInput.push(resp[0].department_id.toString());
    tableInput.push(resp[0].department_name);
    tableInput.push(resp[0].over_head_costs.toFixed(2).toString());
    tableInput.push(salesAdded.toFixed(2).toString());
    tableInput.push((salesAdded.toFixed(2)-resp[0].over_head_costs.toFixed(2)).toFixed(2).toString());
    data.push(tableInput);
    output = table(data, config);
    console.log(output);
    prompt();
  });

}

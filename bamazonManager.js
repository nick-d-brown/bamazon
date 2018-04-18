require('dotenv').config();
// const db = require('db');
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var colors = require('colors');
var figlet = require('figlet');


var managerOps = {
    init: function () {
        inquirer
            .prompt([
                {
                type: "list",
                message: "Please select an option?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"],
                name: "ManagerChoice"
                }
            ])
            .then(function (managerRes) {
                switch (managerRes.ManagerChoice) {
                    case "View Products for Sale":
                        // console.log("View Products for Sale");
                        managerOps.readAll();
                        // connection.end();
                        
                        break;
                    case "View Low Inventory":
                        console.log("View Low Inventory");
                        managerOps.checkInv();
                        // connection.end();
                        
                        break;
                    case "Add to Inventory":
                        console.log("Add to Inventory");
                        managerOps.addInventory();
                        // connection.end();
                        
                        break;
                    case "Add New Product":
                        console.log("Add New Product");
                        managerOps.addItemPrompt();
                        break;
                    case "Quit":
                        console.log("Goodbye.");
                       connection.end();
                        break;
                
                    default:
                        break;
                }
            });
    },
    readAll: function () {
        console.log("Selecting all products available for sale...\n");
        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            var table = new Table({ head: ['Item Id', 'Item Name', 'Item Price', 'Quantity'] });
            for (let i = 0; i < res.length; i++) {
                table.push([res[i].item_id, res[i].product_name, "$" + res[i].price.toFixed(2), res[i].stock_quantity]);
            };
            console.log(table.toString());
            managerOps.init();  
        });
       
    },
    checkInv: function () {
        console.log("Checking Items that have low inventory...\n");
        connection.query("SELECT * FROM products WHERE stock_quantity<5", function (err, res) {
            if (err) throw err;
            var lowInvTable = new Table({ head: ['Item Id', 'Item Name', 'Item Price', 'Quantity'] });
            for (let i = 0; i < res.length; i++) {
                lowInvTable.push([res[i].item_id, res[i].product_name, "$" + res[i].price.toFixed(2), res[i].stock_quantity]);
            };
            console.log(lowInvTable.toString());
            managerOps.init(); 
        });
    },
    addInventory: function () {

        inquirer
            .prompt([
                {
                    name: "updateId",
                    type: "input",
                    message: "What is the Product ID of the new product you are increasing?\n",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            if (value % 1 === 0) {
                                return true;
                            }
                        }

                        return false;
                    }
                },
                {
                    name: "updateQuantity",
                    type: "input",
                    message: "What is the quantity the new product you are increasing?\n",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            if (value % 1 === 0) {
                                return true;
                            }
                        }

                        return false;
                    }
                },
                {
                    name: "confirmUpdateProduct",
                    type: "confirm",
                    message: "Is all of the above information correct?"
                }
            ])
            .then(function (answer) {
                // console.log(answer);
                if (answer.confirmUpdateProduct) {
                    managerActions.updateItem.id = answer.updateId;
                    managerActions.updateItem.quantity = answer.updateQuantity;
                    managerActions.update();
                    // console log success
                    console.log("SUCCESS! Your product has been updated.");
                    // managerOps.readAll();
                    managerOps.init();

                    // print new list of items
                } else {
                    console.log("Ok please re-enter the correct information.");
                    managerOps.addItemPrompt();
                }
            })
    },
    addItemPrompt: function () {
        inquirer
            .prompt([
                {
                    name: "newProductName",
                    type: "input",
                    message: "What is the name of the product you would like to add?\n",
                    validate: function (name){
                                return name !== '';
                                }
                },
                {
                    name: "newProductDept",
                    type: "input",
                    message: "What is the department of the item you would like to add?\n",
                    validate: function (dept){
                                return dept !== '';
                                }
                },
                {
                    name: "newProductPrice",
                    type: "input",
                    message: "How much does the new product cost?\n",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "newProductQuantity",
                    type: "input",
                    message: "What is the quantity the new product you are adding?\n",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            if(value % 1 === 0 ) {
                                return true;
                            }
                        }

                        return false;
                    }
                },
                {
                    name: "confirmNewProduct",
                    type: "confirm",
                    message: "Is all of the above information correct?"
                }
            ])
            .then(function (answer) {
                // console.log(answer);
                
                if (answer.confirmNewProduct) {
                    // Set product values
                    managerActions.newItem.name = answer.newProductName;
                    managerActions.newItem.department = answer.newProductDept;
                    managerActions.newItem.price = answer.newProductPrice;
                    managerActions.newItem.quantity = answer.newProductQuantity;
                    // managerActions.newItem.quantityConverted = managerActions.newItem.quantity.toFixed(0);

                    // add a new product to the inventory
                    managerActions.insert();
                    // console log success
                    console.log("SUCCESS! Your product has been added.");
                    // managerOps.readAll();
                    managerOps.init();
                    
                    // print new list of items
                } else {
                    console.log("Ok please re-enter the correct information.");  
                    managerOps.addItemPrompt();
                }

            });
    }

    
};

var managerActions = 
    {
        newItem: {
            name: "",
            department: "",
            price: null,
            // quantityConverted: null,
            quantity: null
        },
        updateItem:{
            id: null,
            quantity: null
        },
        insert: function () {
            connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES(? , ? , ? , ?);"
                , [
                     managerActions.newItem.name
                    , managerActions.newItem.department
                    , managerActions.newItem.price
                    , managerActions.newItem.quantity
                ],
                function (err, res) {
                    if (err) throw err;
                    
                }
            );
        },
        update: function () {
            connection.query("UPDATE products SET stock_quantity=(stock_quantity+?) WHERE item_id = ?;"
                , [
                    managerActions.updateItem.quantity
                    , managerActions.updateItem.id
                ],
                function (err, res) {
                    if (err) throw err;

                }
        );
    }
}

// .env passkeys to the database
var passKeys = {
    host: process.env.DB_HOST,
    password: process.env.DB_PASS
};

// connection to database
var connection = mysql.createConnection({
    host: passKeys.host,
    port: 3306,
    user: "root",
    password: passKeys.password,
    database: "bamazon"
});

// begins the user db connection and starts process to allow transactions
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    figlet('Manager\n Mode', {
        font: 'Big Money-nw',
        horizontalLayout: 'fitted',
        verticalLayout: 'fitted'
    }, function (err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data);
        managerOps.init();
    });
    
    
});
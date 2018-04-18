require('dotenv').config();
// const db = require('db');
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');
var colors = require('colors');
var figlet = require('figlet');


var crudOps = {
    read: function () {
        console.log("Selecting all products available for sale...\n");
        connection.query("SELECT * FROM products", function (err, res) {
            if (err) throw err;
            // Log all results of the SELECT statement
            // console.log(res); entire respons of the database
            // connection.end(); ends the operation  --- may include back in 

           
            
            // console.log(" | Item ID | Item Name | Item Price | ");
            // for (let i = 0; i < res.length; i++){
            //     console.log(" | " + res[i].item_id + " | " + res[i].product_name + " | $" + res[i].Price + " | ");
            // }
            
            var table = new Table({ head: ['Item Id', 'Item Name', 'Item Price'] });
            for (let i = 0; i < res.length; i++){
                table.push([res[i].item_id, res[i].product_name, "$"+res[i].price.toFixed(2)]);
            };
            console.log(table.toString());
            userActions.continueBuy();
            
        });
    },
    update: function(){
        console.log("Updating product quantities and totaling transaction...\n");
        connection.query("UPDATE products SET ? WHERE ?"
        , [
            {
                stock_quantity: userActions.updateQuantity
            }
            ,{
                item_id:userActions.itemToFind
            }
          ]
        , function (err, res) {
            if (err) throw err;
           // print the total of purchas
            console.log("The total owed is: " + colors.red.bold(userActions.totalOwed)+"\n");
           
           crudOps.read();
        //    userActions.continueBuy();
           
            
        });
    }
}
var userActions = {
    itemToFind: null,
    itemTotal: null,
    updateQuantity: null,
    totalOwed:null,
    continueBuy: function () {
        inquirer
            .prompt(
                {
                    name: "continueBuy",
                    type: "confirm",
                    message: "Would you like to make a purchase?\n",
                }
            )
            .then(function (answer) {
                // console.log(answer);
                
                if (answer.continueBuy) {
                      userActions.initialBuy();
               } else {
                    console.log("OK, thank you for stopping by the Bamazon Storefront!\n".rainbow.bold);
                   connection.end();
                   
               }

            });
    },
    initialBuy: function () {
        inquirer
            .prompt([
                {
                name: "purchaseID",
                type: "input",
                message: "What is the ID of the item you would like to purchase?\n",
                validate: function(value) {
                    if (isNaN(value) === false) {
                        return true;
                        }
                    return false;
                    }
                },
                {
                    name: "purchaseTotal",
                    type: "input",
                    message: "How many units of the item would you like to purchase?\n",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (answer) {
                //check to see if store has enough of product for customer
                userActions.itemToFind = answer.purchaseID;
                userActions.itemTotal = answer.purchaseTotal;
                // console.log(userActions.itemToFind);
                userActions.findItem();
                
            });
    },
    findItem: function () {
        connection.query("SELECT * FROM products WHERE ?",
            {
                item_id: userActions.itemToFind
            },
            function (err, res) {
                if (err) throw err;
                // console.log(res);
                // console.log(res[0].stock_quantity);
                
                // console.log(res[0].RowDataPacket.stock_quantity);
                
                // console.log(res.RowDataPacket.stock_quantity);

                
                if (res[0].stock_quantity < userActions.itemTotal || userActions.itemTotal===null) {
                    console.log("Sorry there is an insufficient quantity of product for that order. Please re-order.\n".red);
                    userActions.initialBuy();
                }
                else {
                    console.log("Your order has been processed.\n".green);
                    // console.log(res[0].stock_quantity);
                    // console.log(userActions.itemTotal);
                    
                    userActions.updateQuantity = (res[0].stock_quantity - parseInt(userActions.itemTotal));
                    userActions.totalOwed = (parseFloat(res[0].price) * parseInt(userActions.itemTotal));
                    // console.log("updated quantity"+userActions.updateQuantity);
                    crudOps.update();
                }
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
    figlet(' Welcome \n     to      \n Bamazon!! \n', {
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
        crudOps.read();
    });
        
});


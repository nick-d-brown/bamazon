CREATE DATABASE bamazon;

--USE BAMAZON DATABASE
USE bamazon;

-- CREATE DATABASE
CREATE TABLE products
    (
        item_id INT NOT NULL AUTO_INCREMENT  PRIMARY KEY
        , product_name VARCHAR(50) NOT NULL
        , department_name VARCHAR(50) NOT NULL
        , price DECIMAL(10,2) NOT NULL 
        , stock_quantity INT NOT NULL DEFAULT 0
    );

-- INSERT 10 ROWS OF DATA
INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES  ("Multi-colored Pen", "Office Supplies", 2.99, 300)
        , ("Legal Notepad", "Office Supplies", 4.99, 100)
        , ("USB Mouse", "Electronics", 29.99, 50)
        , ("Hatchet", "Camping Supplies", 32.00, 80)
        , ("Productivity Journal", "Books", 26.97, 300)
        , ("Tools of Titans", "Books", 19.60, 500)
        , ("Bose Headphones", "Electronics", 349.00, 50)
        , ("Computer Monitor", "Electronics", 270.49, 300)
        , ("Hiking Backpack", "Camping Supplies", 43.99, 250)
        , ("Hatchet", "Books", 8.99, 1000);

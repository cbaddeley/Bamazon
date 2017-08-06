CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NOT NULL,
  department_name VARCHAR(45) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Electric Toothbrush", "Health and Beauty", 39.99, 100);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Lipstick", "Health and Beauty", 4.69, 259);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Shaving Cream", "Health and Beauty", 6.60, 132);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Shampoo", "Health and Beauty", 12.59, 301);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Duffel Bag", "Sports & Outdoors", 40.00, 42);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Women's Yoga Pants", "Sports & Outdoors", 16.99, 11);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Tent", "Sports & Outdoors", 41.60, 12);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Sleeping Bag", "Sports & Outdoors", 36.97, 3);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Men's Hiking Pants", "Sports & Outdoors", 28.08, 77);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Over-Ear Headphones", "Electronics, Computers & Office", 69.99, 59);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("10-inch Tablet", "Electronics, Computers & Office", 173.69, 59);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Radar Detector", "Electronics, Computers & Office", 69.95, 20);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Cookbook", "Books & Audible", 20.97, 6);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Children's Book", "Books & Audible", 6.96, 48);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Fashion Magazine", "Books & Audible", 10.00, 54);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Test Prep", "Books & Audible", 16.93, 66);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Board Game", "Toys, Kids & Baby", 28.82, 410);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Doll", "Toys, Kids & Baby", 19.87, 310);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("RC Car", "Toys, Kids & Baby", 56.99, 73);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Car Seat", "Toys, Kids & Baby", 67.88, 654);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Stroller", "Toys, Kids & Baby", 56.85, 74);
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Baby Monitor", "Toys, Kids & Baby", 35.99, 12);

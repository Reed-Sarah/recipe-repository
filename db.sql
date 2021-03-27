CREATE TABLE users (
  user_id SERIAL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  user_password VARCHAR(255),
  PRIMARY KEY (user_id)
);

CREATE TABLE recipes (
  recipe_id SERIAL NOT NULL,
  user_id INT NOT NULL,
  recipe_title VARCHAR(255),
  ingredients TEXT,
  directions TEXT,
  PRIMARY KEY (recipe_id),
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);


CREATE TABLE ingredients (
  ingredient_id SERIAL,
  recipe_id INT,
  ingredient_name VARCHAR(255),
  amount FLOAT,
  unit VARCHAR(255),
  PRIMARY KEY (ingredient_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
);

CREATE TABLE directions (
  direction_id SERIAL NOT NULL,
  recipe_id INT NOT NULL,
  directions TEXT,
  PRIMARY KEY (direction_id),
  FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id)
);



INSERT INTO users (first_name, last_name, email, user_password) VALUES ('Sarah', 'Reed', 'sarahreed101@hotmail.com', 'Password123!');
Insert INTO recipes (user_id, recipe_title) VALUES ('1', 'Sweet Pork'), ('1', 'Butter Chicken'), ('1', 'Tomatillo Sauce');
Insert INTO recipes (user_id, recipe_title) VALUES ('58', 'Enchiladas'), ('58', 'Biscuits'), ('58', 'Sloppy Joes');
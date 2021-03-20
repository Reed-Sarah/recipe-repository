const { Pool } = require('pg');
require('dotenv').config();
global.loggedIn = false; 
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bcrypt = require('bcrypt');
const { write } = require('fs');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString,
  
ssl: {
rejectUnauthorized: false
}

});


express()
  .use(express.static(path.join(__dirname, '/public')))
  .use(express.urlencoded({
    extended: true
  }))
  .use(express.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', function(req, res) {
      if (global.loggedIn){
          res.render('index');
      }
      else {
        res.render('login');
      }
  })
  .get('/recipes', (req, res) => res.render('recipes'))
  .get('/getRecipes', getRecipes)
  .get('/registration', (req, res) => res.render('registration'))
  .post('/register', register)
  .get('/login', (req, res) => res.render('login'))
  .post('/login', login)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

function getRecipes(req, res){
   var sql = "SELECT recipe_title FROM recipes WHERE user_id = $1;";

pool.query(sql, [global.user_id], function(err, result) {
    // If an error occurred...
    if (err) {
        console.log("Error in query: ")
        console.log(err);
    }

    let recipeList = buildRecipeList(result.rows);
    console.log(recipeList);
    res.send(recipeList);

    // Log this to the console for debugging purposes.
    console.log("Back from DB with result:");
    console.log(result.rows); 
   }); 
}

function buildRecipeList(recipes) {
    let list = "<ul>";
    recipes.forEach(recipe => {
        list += "<li>";
        list += recipe["recipe_title"];
        list += "</li>";
    });
    list += "</ul>";
    console.log(list)
    return list;
}

function register(req, res){
    console.log("saving user....");
    let data = {}
    data = req.body.data;
    console.log(data);
    const salt = 10; 
    let password = data.password;
    bcrypt.hash(password, salt, function(err, hash) {
       data.password = hash;
    data = Object.values(data);
   console.log(data);

    const sql = 'INSERT INTO users (first_name, last_name, email, user_password) VALUES ($1, $2, $3, $4);';
    pool.query(sql, data, function(err, result) {
    // If an error occurred...
    if (err) {
        console.log("Error in query: ");
        console.log(err);
    }
    console.log("account created");
    //global.SESSION['message'] = "Account Created! Please login";
    res.json("Account Created! Please login")
});})
}

function login(req, res){
    let data = {}
    data = req.body.data;
    const sql = "SELECT user_id, user_password FROM users WHERE email = $1";
    pool.query(sql, [data.email], function(err, result) {
    // If an error occurred...
    if (err) {
        console.log("Error in query: ");
        console.log(err);
        res.write("email not found please try again")
    }
    console.log(result.rows[0]['user_password']);
    bcrypt.compare(data.password, result.rows[0]['user_password'], function(err, match) {
        console.log(match);
       res.json(match);
       if (match == true){
           global.user_id = result.rows[0]['user_id'];
           global.loggedIn = true;
           console.log(global.user_id);
       }
    });
})
}

const { Pool } = require('pg');
require('dotenv').config();
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({connectionString: connectionString});

express()
  .use(express.static(path.join(__dirname, '/public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('index'))
  .get('/recipes', (req, res) => res.render('recipes'))
  .get('/getRecipes', getRecipes)
 
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

function getRecipes(req, res){
   var sql = "SELECT recipe_title FROM recipes;";

pool.query(sql, function(err, result) {
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
 
const { Pool } = require('pg');
require('dotenv').config();
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const connectionString = process.env.DATABASE_URL || "postgres://vhyzhflxyytanj:bc4dbbdeb35ca73be7089a137f0f32b085db0d3f4b8bb8e8618c9f175e7508e4@ec2-54-163-140-104.compute-1.amazonaws.com:5432/d8u2qpta90a6r2?ssl=true";
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
 
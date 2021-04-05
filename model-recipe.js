const {
    Pool
} = require('pg');
require('dotenv').config();
const functions = require('./functions');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

function getRecipes(req, res) {
    var sql = "SELECT recipe_title, recipe_id FROM recipes WHERE user_id = $1;";

    pool.query(sql, [global.user_id], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        }

        let recipeList = functions.buildRecipeList(result.rows);
        console.log(recipeList);
        res.send(recipeList);

        // Log this to the console for debugging purposes.
        console.log("Back from DB with result:");
        console.log(result.rows);
    });
}


function saveRecipe(req, res) {
    console.log("saving recipe");
    let data = {}
    data = req.body.data;

    data = Object.values(data);
    console.log(req);
    data.push(global.user_id);
    console.log(data);
    const sql = 'INSERT INTO recipes (user_id, recipe_title, ingredients, directions) VALUES ($4, $1, $2, $3);';
    pool.query(sql, data, function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ");
            console.log(err);
        }
        console.log("Recipe Added");
        res.json("Recipe Successfully added!")
    });
}

function recipe(req, res) {
    console.log(req.query.id)
    var sql = "SELECT * FROM recipes WHERE recipe_id = $1;";
    console.log("getting recipe");
    pool.query(sql, [req.query.id], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        }

        let recipeInfo = result.rows[0];
        recipeInfo.ingredients = recipeInfo.ingredients.split("\n").join("<br>");
        recipeInfo.directions = recipeInfo.directions.split("\n").join("<br><br>");
        console.log("Back from DB with result:");
        console.log(recipeInfo)
        if (global.user_id) {
            res.render('recipe', {
                recipe: recipeInfo
            });
        } else {
            res.render('login')
        }

    });
}

function deleteRecipe(req, res) {
    var sql = "DELETE FROM recipes WHERE recipe_id = $1;";
    console.log("deleting recipe");
    pool.query(sql, [req.body.data.id], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        }
        
    });
}

function editRecipe(req, res){
    var sql = "SELECT * FROM recipes WHERE recipe_id = $1;";
    console.log("getting recipe for editing");
    console.log(req.query)
    console.log(req.query.id)
    pool.query(sql, [req.query.id], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        }

        let recipeInfo = result.rows[0];
        console.log("Back from DB with result:");
        console.log(recipeInfo)
        if (global.user_id) {
            res.render('updateRecipe1', {
                recipe: recipeInfo
            });
            console.log("still going");
        } else {
           res.render('login')
        }
    });
}

function updateRecipe(req, res) {
    console.log("Updating recipe");
    let data = {}
    data = req.body.data;
    data = Object.values(data);
    const sql = 'UPDATE recipes SET recipe_title = $1, ingredients = $2, directions = $3 WHERE recipe_id = $4;';
    pool.query(sql, data, function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ");
            console.log(err);
        }
        console.log("Recipe Updated");
        res.json("Recipe Successfully Updated!")
    });
}

module.exports = {
    getRecipes: getRecipes,
    saveRecipe: saveRecipe,
    recipe: recipe,
    deleteRecipe: deleteRecipe,
    editRecipe: editRecipe,
    updateRecipe: updateRecipe
}
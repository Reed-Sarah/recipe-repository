const {
    Pool
} = require('pg');
require('dotenv').config();
global.loggedIn = false;
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const bcrypt = require('bcrypt');
const session = require('express-session')
const url = require('url');
const cookieParser = require('cookie-parser');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});
//let sess;

express()
    .use(express.static(path.join(__dirname, '/public')))
    .use(express.urlencoded({
        extended: true
    }))
    .use(express.json())
    .use(session({
        resave: true,
        saveUninitialized: true,
        secret: 'keyboard cat'
    }))
    .use(cookieParser())
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', function (req, res) {
        if (global.user_id) {
            res.render('index')
        } else {
            res.render('login')
        }
    })
    .get('/recipe', recipe)
    .get('/getRecipes', getRecipes)
    .get('/registration', (req, res) => res.render('registration'))
    .post('/register', register)
    .get('/login', (req, res) => res.render('login'))
    .post('/login', login)
    .get('/addRecipe', function (req, res) {
        if (global.user_id) {
            res.render('addRecipe')
        } else {
            res.render('login')
        }
    })
    .post('/saveRecipe', saveRecipe)
    .post('/delete', deleteRecipe)
    .get('/edit', editRecipe)
    .post('/updateRecipe', updateRecipe)
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));




function getRecipes(req, res) {
    var sql = "SELECT recipe_title, recipe_id FROM recipes WHERE user_id = $1;";

    pool.query(sql, [global.user_id], function (err, result) {
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
        list += "<a href='/recipe?id=" + recipe["recipe_id"] + "'>"
        list += "<li>";
        list += recipe["recipe_title"];
        list += "</li></a>";
    });
    list += "</ul>";
    console.log(list)
    return list;
}

function register(req, res) {
    console.log("saving user....");
    let data = {}
    data = req.body.data;
    console.log(data);
    const salt = 10;
    let password = data.password;
    bcrypt.hash(password, salt, function (err, hash) {
        data.password = hash;
        data = Object.values(data);
        console.log(data);

        const sql = 'INSERT INTO users (first_name, last_name, email, user_password) VALUES ($1, $2, $3, $4);';
        pool.query(sql, data, function (err, result) {
            // If an error occurred...
            if (err) {
                console.log("Error in query: ");
                console.log(err);
            }
            console.log("account created");
            //global.SESSION['message'] = "Account Created! Please login";
            res.json("Account Created! Please login")
        });
    })
}

function login(req, res) {
    let data = {}
    data = req.body.data;
    const sql = "SELECT user_id, user_password FROM users WHERE email = $1";
    pool.query(sql, [data.email], function (err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ");
            console.log(err);
            res.write("email not found please try again")
        }

        bcrypt.compare(data.password, result.rows[0]['user_password'], function (err, match) {
            console.log(match);
            res.json(match);
            if (match == true) {
                global.user_id = result.rows[0]['user_id'];
                //sess = req.session;
                //sess.user_id = result.rows[0]['user_id'];
                req.session.user_id = result.rows[0]['user_id'];
                req.session.loggedIn = true;

                console.log(req.session.user_id);
            }
        });
    })
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

function verifyLogin(req, res, next) {
    console.log("verifying Login");
    console.log(global.user_id)
    if (global.user_id) {
        next();
    }
    res.end();
    return;
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
    console.log(req.body.data)
    console.log(req.body.data.id)
    
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
    console.log(req.query.data.id)
    pool.query(sql, [req.query.data.id], function (err, result) {
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
            res.render('index', {
                recipe: recipeInfo
            });
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
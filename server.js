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
const account = require('./model-accounts');
const recipe = require('./model-recipe');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
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
    .use(session({
        resave: true,
        saveUninitialized: true,
        secret: 'keyboard cat'
    }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', function (req, res) {
        if (global.user_id) {
            res.render('index')
        } else {
            res.render('login')
        }
    })
    .get('/recipe', recipe.recipe)
    .get('/getRecipes', recipe.getRecipes)
    .get('/registration', (req, res) => res.render('registration'))
    .post('/register', account.register)
    .get('/login', (req, res) => res.render('login'))
    .post('/login', account.login)
    .get('/addRecipe', function (req, res) {
        if (global.user_id) {
            res.render('addRecipe')
        } else {
            res.render('login')
        }
    })
    .post('/saveRecipe', recipe.saveRecipe)
    .post('/delete', recipe.deleteRecipe)
    .get('/edit', recipe.editRecipe)
    .post('/updateRecipe', recipe.updateRecipe)
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const {
    Pool
} = require('pg');
require('dotenv').config();
const bcrypt = require('bcrypt');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

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

module.exports = {
    register: register,
    login: login
}
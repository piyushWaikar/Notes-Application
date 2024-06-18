const { log } = require('console');
const exp = require('constants');
const express = require('express');
const app = express();
const path = require('path');

// req.body => data setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // 

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Setting up CSS, JavaScript routes
app.use(express.static(path.join(__dirname, "public")));

// Package install (npm i uuid) to assign unique id to objects.
const { v4: uuidv4 } = require('uuid');

// Replicating database:
// let posts = [
//     {
//         id: uuidv4(), // Assigning unique id's to individual objects.
//         username: "Apna College",
//         content: "I love Coding"
//     },
//     {
//         id: uuidv4(),
//         username: "Shradha Khapre",
//         content: "I love Teaching. Hard work is important to achieve success"
//     },
//     {
//         id: uuidv4(),
//         username: "Aman Dhattarwal",
//         content: "I love Physics. I got the best physics teacher award."
//     }
// ]

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'Quora',
    password: 'root@4121'
});

app.get('/posts', (req, res) => {
    // Fetching Data from the Server and Rendering on to the index.ejs page
    try {
        connection.query(`SELECT * FROM user`, (err, result) => {
            if (err) throw err;
            let posts = result
            res.render("index", { posts });
        });
    } catch (err) {
        console.log(err.message);
    }

});

app.get('/posts/new', (req, res) => {
    res.render("new.ejs");
});

app.post('/posts/new', (req, res) => {
    let { username, content } = req.body;
    let id = uuidv4();
    let q = `INSERT INTO user (id, username, content) VALUES (?, ?, ?)`;
    let data = [id, username, content];

    try {
        connection.query(q, data, (err, result) => {
            if (err) throw err;
            console.log(result);
        });
    } catch (err) {
        console.log(err.message);
    }

    res.redirect('/posts');
});

app.get('/posts/edit/:id', (req, res) => {

    try {
        let { id } = req.params;

        // Finding the user using id and rendering users data to edit.ejs
        connection.query('SELECT * FROM user WHERE id = ?', [id], (err, result) => {
            if (err) throw err;
            let [{ id, username, content }] = result;
            res.render("edit.ejs", { id, username, content });
        });
    } catch (err) {
        console.log(err.message);
    }
});

// To use patch method to update the data we have to use npm i method-override
const methodOverride = require('method-override');
app.use(methodOverride("_method"));

app.patch('/posts/edit/:id', (req, res) => {
    try {
        let { id } = req.params;
        let { content } = req.body;
        connection.query('UPDATE user SET content=? WHERE id = ?', [content, id], (err, result) => {
            if (err) throw err;
            res.redirect('/posts');
        });
    } catch (err) {
        console.log(err.message);
    }
});

app.delete('/posts/delete/:id', (req, res) => {
    let { id } = req.params;

    // Finding user post using post id and deleting it from database .
    try {
        connection.query('DELETE FROM user WHERE id = ?', [id], (err, result) => {
            if (err) throw err;
        });
    } catch (err) {
        console.log(err.message);
    }

    res.redirect('/posts');
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

//database
let db = new sqlite3.Database('./db/portal.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to lite portal database.');
});

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

//error types
const internalServerError = {status: 500, message: 'Some error occurred!'};
const unauthorized = {status: 401, message: 'Invalid Username or Password!'};
const conflict = {status: 409, message: 'Username already taken!'};

//routes
let router = express.Router();
router.get('/', function (req, res) {
    res.send('welcome to server');
});
router.post('/login', function (req, res) {
    let sql = `select name,username,isAdmin from users where username = ? and password = ?`;
    db.get(sql, [req.body.username, req.body.password], (err, row) => {
        console.log(row, err);
        if (err) res.send(internalServerError);
        else if (row) res.send({status: 200, data: row});
        else res.send(unauthorized)
    });
});
router.post('/signup', function (req, res) {
    const checktable = `SELECT name FROM sqlite_master WHERE type='table' AND name='users';`;
    let createTable = `create table users(
   username char(25),
   name char(50),
   password char(50),
   isAdmin bit,
   primary key(username)
   )`;
    let usr = req.body;
    let insertUser = `insert into users values(?,?,?,?)`;
    db.get(checktable, [], (err, row) => {
        console.log(err, row);
        if (err) res.send(internalServerError);
        else if (row) {
            db.run(insertUser, [usr.name, usr.username, usr.password, 0], err => {
                if (err) if (err.code == 'SQLITE_CONSTRAINT') res.send(conflict); else res.send(internalServerError);
                else res.send({status: 200});
            });
        }
        else {
            db.run(createTable, err => {
                if (err) res.send(internalServerError);
                else db.run(insertUser, [usr.name, usr.username, usr.password, 1], err => {
                    if (err) if (err.code == 'SQLITE_CONSTRAINT') res.send(conflict); else res.send(internalServerError);
                    else res.send({status: 200});
                });
            });
        }
    })
});
router.post('/getallusers', function (req, res) {
    const getUsers = `select * from users`;
    db.all(getUsers, [], (err, rows) => {
        if (err) res.send(internalServerError);
        else res.send({status: 200, data: rows});
    })
});
router.delete('/deleteuser/:username', function (req, res) {
    const deleteUser = `delete from users where username = ?`;
    db.run(deleteUser, [req.params.username], err => {
        if (err) {
            res.send(internalServerError);
            console.log(err);
        }
        else res.send({status: 200});
    });
});
router.put('/makeadmin/:username', function (req, res) {
    const makeAdmin = `update users set isAdmin=1 where username = ?`;
    db.run(makeAdmin, [req.params.username], err => {
        if (err) res.send(internalServerError);
        else res.send({status: 200});
    });
});

app.use('/', router);
app.listen('8080', () => console.log(`listening on port 8080!`));
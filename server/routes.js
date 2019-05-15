const sqlite3 = require('sqlite3').verbose();

//error types
const internalServerError = {status: 500, message: 'Some error occurred!'};
const unauthorized = {status: 401, message: 'Invalid Username or Password!'};
const conflict = {status: 409, message: 'Username already taken!'};
const primaryKeyConflict = 'SQLITE_CONSTRAINT';

//database
let db = new sqlite3.Database('./db/portal.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to lite portal database.');
});

//routes
let router = require('express').Router();
router.get('/', welcome);
router.post('/login', getUser);
router.post('/getallusers', getUsers);
router.delete('/deleteuser/:username', deleteUser);
router.put('/makeadmin/:username', makeAdmin);
router.post('/signup', addUser);

function welcome(req, res) {
    res.send('welcome to server');
}

function getUser(req, res) {
    let sql = `select name,username,isAdmin from users where username = ? and password = ?`;
    db.get(sql, [req.body.username, req.body.password], (err, row) => {
        console.log(row, err);
        if (err) res.send(internalServerError);
        else if (row) res.send({status: 200, data: row});
        else res.send(unauthorized)
    });
};

function insertUser(isadmin, usr, res) {
    let insertUser = `insert into users values(?,?,?,?)`;
    db.run(insertUser, [usr.name, usr.username, usr.password, isadmin], err => {
        if (err) if (err.code === primaryKeyConflict) res.send(conflict); else res.send(internalServerError);
        else res.send({status: 200});
    });
}

function addUser(req, res) {
    const checktable = `SELECT count(*) from users;`;
    let createTable = `create table if not exists users(
   username char(25),
   name char(50),
   password char(50),
   isAdmin bit,
   primary key(username)
   )`;
    let usr = req.body;
    db.run(createTable, [], err => {
        if (err) res.send(internalServerError);
        db.get(checktable, [], (err, row) => {
            console.log(row['count(*)']);
            if (err) res.send(internalServerError);
            else if (row['count(*)'] > 0) insertUser(0, usr, res);
            else insertUser(1, usr, res);
        })
    });
}

function getUsers(req, res) {
    const getUsers = `select * from users`;
    db.all(getUsers, [], (err, rows) => {
        if (err) res.send(internalServerError);
        else res.send({status: 200, data: rows});
    })
}

function deleteUser(req, res) {
    const deleteUser = `delete from users where username = ?`;
    db.run(deleteUser, [req.params.username], err => {
        if (err) {
            res.send(internalServerError);
            console.log(err);
        }
        else res.send({status: 200});
    });
}

function makeAdmin(req, res) {
    const makeAdmin = `update users set isAdmin=1 where username = ?`;
    db.run(makeAdmin, [req.params.username], err => {
        if (err) res.send(internalServerError);
        else res.send({status: 200});
    });
}

module.exports = router;
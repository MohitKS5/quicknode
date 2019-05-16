const http = require('axios');
//error types
const internalServerError = {status: 500, message: 'Some error occurred!'};
const unauthorized = {status: 401, message: 'Invalid Username or Password!'};
const conflict = {status: 409, message: 'Username already taken!'};
const primaryKeyConflict = 'SQLITE_CONSTRAINT';

//database params
const host = 'http://localhost:9200/';

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
    let usr = req.body;
    http.get(host + 'users/_doc/' + usr.username)
        .then(resp => {
            let user = resp.data._source;
            if (user.password === usr.password) res.send({status: 200, data: user});
            else res.send(unauthorized);
        })
        .catch(err => {
            console.log(err);
            res.send(unauthorized)
        })
}

function insertUser(isadmin, usr, res) {
    http.put(host + 'users/_doc/' + usr.username, {
        isAdmin: isadmin,
        ...usr
    }).then(resp => {
        if (resp.error) {
            res.send(internalServerError);
            console.log(res);
        }
        else res.send({status: 200});
    }).catch(err => {
        console.log(err);
        res.send(internalServerError);
    })
}

function addUser(req, res) {
    let usr = req.body;
    http.get(host + 'users/_search')
        .then(resp => insertUser(0, usr, res))
        .catch(err => err.response.data.status === 404 ? insertUser(1, usr, res) : res.send(internalServerError));
}

function getUsers(req, res) {
    http.get(host + 'users/_search')
        .then(resp => {
            console.log(resp.data);
            res.send({status: 200,data: resp.data.hits.hits.map(user => user._source)})
        })
        .catch(err => {
            console.log(err);
            res.send(internalServerError);
        })
}

function deleteUser(req, res) {
    let id = req.params.username;
    http.delete(host + 'users/_doc/' + id).then(resp => res.send({status: 200})).catch(err => {
        console.log(err);
        res.send(internalServerError);
    })
}

function makeAdmin(req, res) {
    let id = req.params.username;
    http.post(host + 'users/_update/' + id, {
        "doc": {
            'isAdmin': 1
        }
    }).then(() => res.send({status: 200}))
        .catch(err => res.send(internalServerError));
}

module.exports = router;
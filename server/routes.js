const client = require('./config');

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
    client.get({id: usr.username, index: 'users', type: '_doc'}, function (err, resp) {
        if (err) {
            console.log(err);
            res.send(unauthorized)
        } else {
            let user = resp.body._source;
            if (user.password === usr.password) res.send({status: 200, data: user});
            else res.send(unauthorized);
        }
    });
}

function insertUser(isadmin, usr, res) {
    async function run() {
       return await client.index({
            index: 'users',
            id: usr.username,
            type: '_doc',
            body: {
                isAdmin: isadmin,
                ...usr
            }
        });
    }

    run().then(resp => res.send({status: 200}))
        .catch(err => {
            console.log(err);
            res.send(internalServerError);
        })
}

function addUser(req, res) {
    let usr = req.body;

    async function run() {
       return await client.search({
            index: 'users',
            type: '_doc',
        })
    }

    run().then(resp => insertUser(0, usr, res))
        .catch(err => {
            console.log(err);
            err.response.data.status === 404 ? insertUser(1, usr, res) : res.send(internalServerError)
        });
}

function getUsers(req, res) {
    async function run() {
        return await client.search({
            index: 'users',
            type: '_doc'
        })
    }

    run().then(resp => {
            // console.log(resp);
            res.send({status: 200, data: resp.body.hits.hits.map(user => user._source)})
        })
        .catch(err => {
            console.log(err);
            res.send(internalServerError);
        })
}

function deleteUser(req, res) {
    let id = req.params.username;
    async function run(){
        return await client.delete({
            index: 'users',
            id: id,
            type: '_doc'
        })
    }
   run().then(resp => res.send({status: 200})).catch(err => {
        console.log(err);
        res.send(internalServerError);
    })
}

function makeAdmin(req, res) {
    let id = req.params.username;
    async function run(){
        return await client.update({
            index: 'users',
            id: id,
            body: {
                doc: {
                    isAdmin: 1
                }
            }
        })
    }
    run().then(() => res.send({status: 200}))
        .catch(err => res.send(internalServerError));
}

module.exports = router;
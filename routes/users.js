router = require('express').Router();
const db = require('../db.js');

module.exports = router;

function getUsers(isManager, view, req, res, next) {
    db.getUsers(isManager)
        .then((users) => {
            res.render(view, { users, tab: view });
        })
        .catch((err) => {
            next(err);
        });
}

router.get('/', (req, res, next) => {
    getUsers(false, 'users', req, res, next);
});

router.get('/managers', (req, res, next) => {
    getUsers(true, 'managers', req, res, next);
});

router.post('/', (req, res, next) => {
    db.createUser({ name: req.body.name, isManager: req.body.isManager ? true : false })
        .then(() => {
            req.body.isManager ? res.redirect('/users/managers') : res.redirect('/users');
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/:id', (req, res, next) => {
    db.updateUser(+req.params.id, { name: 'manager', value: req.body.isManager })
        .then(() => {
            req.body.isManager === 'TRUE' ? res.redirect('/users/managers') : res.redirect('/users');
        })
        .catch((err) => {
            next(err);
        });
});

router.delete('/:id', (req, res, next) => {
    db.deleteUser(+req.params.id)
        .then(() => {
            res.redirect('/users');
        })
        .catch((err) => {
            next(err);
        });
});
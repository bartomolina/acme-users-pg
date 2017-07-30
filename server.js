const express = require('express');
const path = require('path');
const swig = require('swig');
const db = require('./db');
swig.setDefaults({ cache: false });

const app = express();
const port = process.env.PORT || 3000;

function syncDB() {
    return db.sync()
        .then((res) => {
            return db.seed();
        })
        .then((res) => {
            console.log('DB synch and seed complete');
        })
        .catch((err) => {
            console.log(err);
        });
}

app.listen(port, () => {
    console.log(`listening on port ${port}`);
    return syncDB();
});

app.set('view engine', 'html');
app.engine('html', swig.renderFile);

app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(require('method-override')('_method'));

app.use((req, res, next) => {
    Promise.all([
        db.getUsers(false),
        db.getUsers(true)
    ])
        .then((users) => {
            res.locals.userCount = users[0].length;
            res.locals.managerCount = users[1].length;
            next();
        })
        .catch((err) => {
            next(err);
        });
});

app.get('/', (req, res, next) => {
    res.render('index', { tab: 'home' });
});

app.post('/', (req, res, next) => {
    syncDB()
        .then(() => {
            res.redirect('/');
        })
        .catch((err) => {
            next(err);
        });
});

app.use('/users', require('./routes/users'));

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.render('error', { error: err });
})
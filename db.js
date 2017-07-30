const pg = require('pg');
const Promise = require("bluebird");

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/acmeusersdb';
var client = new pg.Client(connectionString);

client.connect((err) => {
    if (err) {
        console.log(err.stack);
    }
});

function query(query, params) {
    return new Promise((resolve, reject) => {
        client.query(query, params, (err, res) => {
            err ? reject(err) : resolve(res);
        });
    });
}

function sync() {
    const sql = `DROP TABLE IF EXISTS users;
        CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        manager BOOLEAN NOT NULL DEFAULT FALSE
    );`;
    return query(sql);
}

function seed() {
    return Promise.all([
        createUser({ name: 'Homer', isManager: true }),
        createUser({ name: 'Marge', isManager: true }),
        createUser({ name: 'Bart', isManager: false }),
        createUser({ name: 'Lisa', isManager: false }),
        createUser({ name: 'Maggie', isManager: false })
    ]);
}

function getUser() {

}

function getUsers(isManager) {
    let sql = "SELECT * FROM users";
    if (isManager) sql += " WHERE manager = TRUE"
    return query(sql)
        .then((res) => {
            return res.rows;
        });
}

function createUser(user) {
    user.name = user.name ? user.name : null;
    const sql = "INSERT INTO users(name, manager) VALUES ($1, $2)";
    return query(sql, [user.name, user.isManager]);
}

function updateUser(id, prop) {
    const sql = `UPDATE users SET ${prop.name} = $1 WHERE id = $2`;
    return query(sql, [prop.value, id]);
}

function deleteUser(id) {
    const sql = 'DELETE FROM users WHERE id = $1';
    return query(sql, [id]);
}

module.exports = {
    sync,
    seed,
    getUsers,
    createUser,
    updateUser,
    deleteUser
}
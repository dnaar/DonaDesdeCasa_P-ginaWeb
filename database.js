const mysql = require('mysql');
const database = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
});
database.connect((err) => {
    if (err) throw err;
});

module.exports = database;
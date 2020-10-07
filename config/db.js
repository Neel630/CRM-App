const mysql = require('mysql');
const config = require('config');
const host = config.get('host');
const password = config.get('password');
const user = config.get('user');
const database = config.get('database');

const db = mysql.createConnection({
  host,
  user,
  password,
  database,
});

const connect = () => {
  try {
    db.connect();
  } catch (err) {
    throw err;
  }
  console.log('DB Connected');
};

module.exports = { connect, db };

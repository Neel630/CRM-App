const express = require('express');
const mysql = require('mysql');

const app = express();

const db = mysql.createConnection({
  host: 'bge6ne8wbc1bbqr1az2f-mysql.services.clever-cloud.com',
  user: 'uhrp9yqy7ytgbfho',
  password: 'v4FDb4hE8aVqjK0XTWvK',
  database: 'bge6ne8wbc1bbqr1az2f',
});

db.connect((err) => {
  if (err) throw err;
  console.log('DB Connected');
});

app.listen('3000', () => {
  console.log('Server started...');
});

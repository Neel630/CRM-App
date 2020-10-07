const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { connect } = require('./config/db');

connect();

// app.use('/', (req, res) => {
//   res.send('hello');
// });

//const jsonParser = bodyParser.json();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started at port ${PORT}`));

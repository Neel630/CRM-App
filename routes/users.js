const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { check, validationResult } = require('express-validator');
const session = require('express-session');
const config = require('config');
const database = config.get('database');

//@route        POST /user
//@desc         Getting User Specific Table
//@access       Private

router.post(
  '/user',
  [
    check('name', 'Enter User Name').not().isEmpty(),
    check('email', 'Please enter valid email').isEmail(),
    check('password', 'Enter password of minimum length 4').isLength({
      min: 4,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    let sql = `SELECT * FROM Users WHERE email = "${email}"`;

    let query = db.query(sql, (err, results) => {
      results.length === 0
        ? res.send('User with this Email does not exist')
        : results[0].password === password
        ? res.send(results)
        : res.send('Invalid password');
    });
  }
);

//@route        POST /createtabel
//@desc         Creating User Specific Table if not exist
//@access       Private

router.post(
  '/createtabel',
  [
    check('name', 'Enter User Name').not().isEmpty(),
    check('email', 'Please enter valid email').isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // let sql = `WITH r AS ( SELECT * FROM information_schema.tables WHERE table_schema = '${database}' AND table_name = '${email}' LIMIT 1 ) SELECT * FROM r UNION ALL SELECT * FROM \`Users\` AND NOT EXISTS ( SELECT * FROM r )`;

    let sql = `SELECT * FROM information_schema.tables WHERE table_schema = '${database}' AND table_name = '${email}' LIMIT 1`;

    let query = db.query(sql, async (err, results) => {
      if (results.length === 0) {
        let sqlCreateTabel = `CREATE TABLE \`bge6ne8wbc1bbqr1az2f\`.\`${email}\` ( \`id\` INT NOT NULL AUTO_INCREMENT , \`firstname\` VARCHAR(255) NOT NULL , \`lastname\` VARCHAR(255) NOT NULL , \`phone\` INT(10) NOT NULL , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`;
        db.query(sqlCreateTabel, (errTables, resultsTabels) => {
          console.log(resultsTabels);
        });
      }
      results.length === 0
        ? res.send('Tabel Created with default columns')
        : res.send('Tabel exists');
    });
  }
);

module.exports = router;

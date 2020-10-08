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
      let msg =
        results.length === 0
          ? 'User with this Email does not exist'
          : results[0].password === password
          ? results
          : 'Invalid password';

      res.json({ msg });
    });
  }
);

//@route        POST /createtable
//@desc         Creating User Specific Table if not exist
//@access       Private

router.post(
  '/createtable',
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

    let query = db.query(sql, (err, results) => {
      if (results.length === 0) {
        let sqlCreateTable = `CREATE TABLE \`bge6ne8wbc1bbqr1az2f\`.\`${email}\` ( \`id\` INT NOT NULL AUTO_INCREMENT , \`firstname\` VARCHAR(255) NOT NULL , \`lastname\` VARCHAR(255) NOT NULL , \`phone\` INT(10) NOT NULL , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`;
        db.query(sqlCreateTable, (errTables, resultsTables) => {
          console.log(resultsTables);
        });
      }

      let msg =
        results.length === 0
          ? 'Table Created with default columns'
          : 'Table exists';

      res.json({ msg });
    });
  }
);

//@route        POST /gettable
//@desc         Getting User specific table
//@access       Private

router.post(
  '/gettable',
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

    let sql = `SELECT * FROM \`${email}\``;

    let columnSql = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'${email}' ORDER BY ORDINAL_POSITION`;

    let msg = {};

    let query = db.query(columnSql, (err, results) => {
      db.query(sql, (errorTable, resultTable) => {
        let columns = {};
        for (let i = 0; i < results.length; i++) {
          columns[i] = results[i]['COLUMN_NAME'];
        }
        msg['columns'] = columns;
        msg['tables'] = resultTable;
        res.send(msg);
      });
    });
  }
);

module.exports = router;

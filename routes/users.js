const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { check, validationResult } = require('express-validator');
const config = require('config');
const database = config.get('database');

//@route        POST /user
//@desc         User Authentication

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

      let status = results.length===0 ? 404 : results[0].password===password ? 200 : 401;
      res.status(status).json({ msg });
    });
  }
);

//@route        POST /createtable
//@desc         Creating User Specific Table if not exist

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
        let sqlCreateTable = `CREATE TABLE \`bge6ne8wbc1bbqr1az2f\`.\`${email}\` ( \`id\` INT NOT NULL AUTO_INCREMENT , \`firstname\` VARCHAR(255) NOT NULL , \`lastname\` VARCHAR(255) NOT NULL , \`phone\` BIGINT(15) NOT NULL , PRIMARY KEY (\`id\`)) ENGINE = InnoDB;`;
        db.query(sqlCreateTable, (errTables, resultsTables) => {});
      }

      let msg =
        results.length === 0
          ? 'Table Created with default columns'
          : 'Table exists';

      res.json({ msg });
    });
  }
);

//@route        GET /gettable
//@desc         Getting User specific table

router.get(
  '/gettable/:tablename',
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let sql = `SELECT * FROM \`${req.params.tablename}\``;

    let columnSql = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'${req.params.tablename}' ORDER BY ORDINAL_POSITION`;

    let msg = {};

    let query = db.query(columnSql, (err, results) => {
      db.query(sql, (errorTable, resultTable) => {
        let columns = {};
        for (let i = 0; i < results.length; i++) {
          columns[i] = results[i]['COLUMN_NAME'];
        }
        msg['columns'] = columns;
        msg['tables'] = resultTable;
        res.json({ msg });
      });
    });
  }
);



//@route        POST /insertrow
//@desc         Insert new row in table

router.post(
  '/insertrow',
  [
    check('email', 'Please enter valid email').isEmail(),
    check('columnName', 'Please enter column name to add').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, columnName } = req.body;

    let columnKeys = "(";
    let values = "(";

    for(let keys = Object.keys(columnName), i = 0, end = keys.length; i < end; i++) {
      let key = keys[i];
      if(i==end-1){
        columnKeys += `\`${key}\``
        values += `'${columnName[key]}'`;
      } else{
        columnKeys += `\`${key}\` ,`
        values += `'${columnName[key]}' ,`;
      }
    };

    columnKeys += ")";
    values += ")";

    let sql = `INSERT INTO \`${email}\` ${columnKeys} VALUES ${values}`

    console.log(sql);
    let query = db.query(sql, (err, results) => {
      let msg = results;
      if(!results){
        msg = "Error encounter!";
      }
      res.json({ msg: results });
    });
  }
);


//@route        PUT /addcolumn
//@desc         Add user specific column to table

router.put(
  '/addcolumn',
  [
    check('name', 'Enter User Name').not().isEmpty(),
    check('email', 'Please enter valid email').isEmail(),
    check('columnName', 'Please enter column name to add').not().isEmpty(),
    check(
      'isText',
      'Please specify column type(Text or Numeric) boolean'
    ).isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, columnName, isText } = req.body;

    let dataType = isText ? 'VARCHAR(255)' : 'BIGINT(255)';

    let sql = `ALTER TABLE \`${email}\` ADD \`${columnName}\` ${dataType} NOT NULL`;

    let query = db.query(sql, (err, results) => {
      let msg = results;
      if(!results){
        msg = "Error encounter!";
      }
      res.json({ msg: results });
    });
  }
);


//@route        PUT /updatecolumn
//@desc         Update column of User specific table

router.put(
  '/updatecolumn',
  [
    check('id', 'Enter id').not().isEmpty(),
    check('email', 'Please enter valid email').isEmail(),
    check('columns', 'Please enter column/columns name and values to add').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, id, columns } = req.body;

    let updateColumns = "";

    for(let keys = Object.keys(columns), i = 0, end = keys.length; i < end; i++) {
      let key = keys[i];
      if(i==end-1){
        updateColumns += `\`${key}\` = '${columns[key]}' `;
      } else{
        updateColumns += `\`${key}\` = '${columns[key]}', `;
      }
    };

    let sql = `UPDATE \`${email}\` SET ${updateColumns} WHERE \`${email}\`.\`id\` = ${id} `;
    let query = db.query(sql, (err, results) => {
      let msg = "";
      if(!results){
        msg = "Error encounter! Check email and columns";
      }
      else if(results["affectedRows"]>0){
        msg = "Tabel Updated Successfully";
      }else{
        msg = "No row to update";
      }

      res.json({ msg });
    });
  }
);



module.exports = router;

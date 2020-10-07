const express = require('express');
const router = express.Router();
const { db } = require('../config/db');
const { check, validationResult } = require('express-validator');

//@route        POST /user
//@desc         Getting User Specific Table
//@access       Public

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

module.exports = router;

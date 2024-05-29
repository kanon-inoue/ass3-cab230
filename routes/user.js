var express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var router = express.Router();

router.post('/login', function (req, res, next) {
  if (!req.query.email || !req.query.password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required"
    });
    return;
  }

  const queryUsers = req.db.from("user").select("*").where("email", "=", req.query.email);
  queryUsers
    .then(users => {
      if (users.length === 0) {
        return res.status(401).json({
          error: true,
          message: "Incorrect email or password"
        })
      }

      const user = users[0];
      return bcrypt.compare(req.query.password, user.password);
    })
    .then(match => {
      if (!match) {
        return res.status(401).json({
          error: true,
          message: "Incorrect email or password"
        })
      }
      const expires_in = 60 * 60 * 24; // 24 hours
      const exp = Math.floor(Date.now() / 1000) + expires_in;
      const token = jwt.sign({ exp }, process.env.JWT_SECRET);
      res.status(200).json({
        token,
        token_type: "Bearer",
        expires_in
      });
    });
});

router.post("/register", function (req, res) {
  if (req.query.email && req.query.password) {
    const queryUsers = req.db.from("user").select("*").where("email", "=", req.query.email);
    queryUsers.then(users => {
      if (users.length > 0) {
        return res.status(409).json({error: true, message: "User already exists"});
      }
  
      const saltRounds = 10;
      const hash = bcrypt.hashSync(req.query.password, saltRounds);
      req.db
        .insert({
          email: req.query.email,
          password: hash
        })
        .into("user")
        .then(() => res.status(201).json({message: "User created"}))
        .catch((err) => {
          console.log(err);
          res.status(500).json({error: true, message: "MySQL Error"});
        })
    })
  } else {
    res.status(400).json({
      message: "Request body incomplete, both email and password are required",
      error: true
    })
  }
});

module.exports = router;
var express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var router = express.Router();
const authorization = require("../middleware/authorization");

router.put("/:email/profile", authorization, function (req, res, next) {
  if (!req.query.firstName || !req.query.lastName || !req.query.dob || !req.query.address) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete: firstName, lastName, dob and address are required."
    })
  }
  if (typeof req.query.firstName !== "string" || typeof req.query.lastName !== "string" || typeof req.query.address !== "string") {
    return res.status(400).json({
      error: true,
      message: "Request body invalid: firstName, lastName and address must be strings only."
    })
  }
  const queryEmail = req.db.from("user").select("*").where("email", "=", req.params.email)
  queryEmail
    .then(users => {
      if (users.length === 0) {
        return res.status(403).json({
          error: true,
          message: "Forbidden"
        })
      }
      const user = users[0];
      const token = req.headers.authorization.replace(/^Bearer /, "");
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (user.email !== decoded.email) {
          return res.status(403).json({
            error: true,
            message: "Forbidden"
          })
        }
      });

      req.db("user")
        .where("email", "=", req.params.email)
        .update(req.query)
        .then((cols) => {
          res.json(cols);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({error: true, message: "Error in MySQL query"});
        }); 
    })
})

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
      const token = jwt.sign({ exp, email: req.query.email }, process.env.JWT_SECRET);
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
var express = require("express");
var router = express.Router();
const jwt = require('jsonwebtoken');
const authorization = require("../middleware/authorization");
const uuid = require("uuid");

router.get("/comments/:volcano_id", authorization, function (req, res, next) {
  req.db
    .from("comment")
    .select("comment", "email")
    .where("volcano_id", "=", req.params.volcano_id)
    .then((rows) => {
      if (volcanoes.length === 0) {
        return res.status(404).json({
          error: true,
          message: "Volcano not found."
        })
      }
      res.json({error: false, message: "Success", data: rows});
    })
    .catch((err) => {
      console.log(err);
      res.json({error: true, message: "Error in MySQL query"});
    }); 
})

router.post("/comments/:volcano_id", authorization, function (req, res, next) {
  if (!req.query.comment) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, comment must be present."
    });
  }
  req.db
    .from("data")
    .select("*")
    .where("id", "=", req.params.id)
    .then((volcanoes) => {
      if (volcanoes.length === 0) {
        return res.status(404).json({
          error: true,
          message: "Volcano not found."
        })
      }
    })
  const token = req.headers.authorization.replace(/^Bearer /, "");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    req.db
      .insert({
        id: uuid.v4(),
        email: decoded.email,
        comment: req.query.comment,
        volcano_id: req.params.volcano_id
      })
      .into("comment")
      .then(() => {
        res.json({error: false, message: "Comment successfully posted"});
      })
  });
})

router.get("/countries", function (req, res, next) {
  req.db
    .distinct()
    .from("data")
    .pluck("country")
    .orderBy("country")
    .then((rows) => {
      res.json({error: false, message: "Success", data: rows});
    })
})

router.get("/volcano/:id", function (req, res, next) {
  req.db
    .from("data")
    .select("id", "name", "country", "region", "subregion")
    .where("id", "=", req.params.id)
    .then((rows) => {
      res.json({error: false, message: "Success", data: rows});
    })
    .catch((err) => {
      console.log(err);
      res.json({error: true, message: "Error in MySQL query"});
    }); 
});

router.get("/volcanoes", function (req, res, next) {
  req.db
    .from("data")
    .select("*")
    .where("country", "=", req.query.country)
    .modify((queryBuilder) => {
      if ("5km" === req.query.populatedWithin) {
        queryBuilder.where("population_5km", ">", 0)
      } else if ("10km" === req.query.populatedWithin) {
        queryBuilder.where("population_10km", ">", 0)
      } else if ("30km" === req.query.populatedWithin) {
        queryBuilder.where("population_30km", ">", 0)
      } else if ("100km" === req.query.populatedWithin) {
        queryBuilder.where("population_100km", ">", 0)
      }
    })
    .then((rows) => {
      res.json({error: false, message: "Success", data: rows});
    })
    .catch((err) => {
      console.log(err);
      res.json({error: true, message: "Error in MySQL query"});
    }); 
});

module.exports = router;
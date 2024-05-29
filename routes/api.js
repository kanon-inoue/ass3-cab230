var express = require("express");
var router = express.Router();

router.get("/countries", function (req, res, next) {
  req.db
    .distinct()
    .from("data")
    .pluck("country")
    .orderBy("country")
    .then((rows) => {
      res.json({Error: false, Message: "Success", Data: rows});
    })
})

router.get("/volcano/:id", function (req, res, next) {
  req.db
    .from("data")
    .select("id", "name", "country", "region", "subregion")
    .where("id", "=", req.params.id)
    .then((rows) => {
      res.json({Error: false, Message: "Success", Data: rows});
    })
    .catch((err) => {
      console.log(err);
      res.json({Error: true, Message: "Error in MySQL query"});
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
    res.json({Error: false, Message: "Success", Data: rows});
  })
  .catch((err) => {
    console.log(err);
    res.json({Error: true, Message: "Error in MySQL query"});
  }); 
});

module.exports = router;
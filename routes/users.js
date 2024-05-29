var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  req.db
  .from("data")
  .select("id", "name", "country", "region", "subregion")
  .where("id", "=", req.query.id)
  .then((rows) => {
    res.json({Error: false, Message: "Success", Data: rows});
  })
  .catch((err) => {
    console.log(err);
    res.json({Error: true, Message: "Error in MySQL query"});
  }); 
});

module.exports = router;
var express = require('express');
var router = express.Router();

/* GET required control endpoint. */
router.get('/', function(req, res, next) {
  res.json({ name: 'Kanon Inoue', student_number: "n11186267" });
});

module.exports = router;

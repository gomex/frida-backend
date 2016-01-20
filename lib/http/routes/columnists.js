var columnistRepository = require('../../columnist-repository');
var express = require('express');

var router = express.Router();

router.route('/')

  .get(function(req, res) {
    columnistRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

module.exports = router;

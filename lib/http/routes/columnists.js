var express = require('express');

var columnistRepository = require('../../columnist/columnist-repository');
var simpleAuth          = require('../simple-auth');

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

router.route('/')

  .get(simpleAuth(EDITOR), function(req, res) {
    columnistRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

module.exports = router;

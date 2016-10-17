var express = require('express');
var router = express.Router();
var controller = require('../../controllers/home.js');

router.route('/:name')
  .get(controller.getByName);

module.exports = router;

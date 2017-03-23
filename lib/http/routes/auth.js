var express = require('express');

var authController = require('lib/controllers/auth');

var router = express.Router();

router.route('/')

  .post(authController.authenticated);

module.exports = router;

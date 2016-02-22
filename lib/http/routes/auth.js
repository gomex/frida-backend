var express        = require('express');

var authController = require('../../controllers/auth');
var simpleAuth     = require('../simple-auth');

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

router.route('/')

  .post(simpleAuth(EDITOR), authController.authenticated);

module.exports = router;

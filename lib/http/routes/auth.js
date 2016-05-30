var express        = require('express');

var authController = require('../../controllers/auth');
var authenticator     = require('../authenticator');

var router = express.Router();

router.route('/')

  .post(authenticator, authController.authenticated);

module.exports = router;

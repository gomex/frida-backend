var express        = require('express');

var authController = require('../../controllers/auth');
var simpleAuth     = require('../simple-auth');

var router = express.Router();

router.route('/')

  .post(simpleAuth, authController.authenticated);

module.exports = router;

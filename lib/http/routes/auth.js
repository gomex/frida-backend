var express        = require('express');

var authController = require('../../controllers/auth');

var router = express.Router();

router.route('/')

  .post(authController.authenticated);

module.exports = router;

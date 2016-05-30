var express              = require('express');

var columnistsController = require('../../controllers/columnists');
var authenticator           = require('../authenticator');

var router = express.Router();

router.route('/')

  .get(authenticator, columnistsController.getAllColumnists);

module.exports = router;

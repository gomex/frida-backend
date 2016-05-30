var express              = require('express');

var columnistsController = require('../../controllers/columnists');
var simpleAuth           = require('../simple-auth');

var router = express.Router();

router.route('/')

  .get(simpleAuth, columnistsController.getAllColumnists);

module.exports = router;

var express              = require('express');

var columnistsController = require('../../controllers/columnists');
var simpleAuth           = require('../simple-auth');

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

router.route('/')

  .get(simpleAuth(EDITOR), columnistsController.getAllColumnists);

module.exports = router;

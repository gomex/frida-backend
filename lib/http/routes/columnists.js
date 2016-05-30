var express              = require('express');

var columnistsController = require('../../controllers/columnists');

var router = express.Router();

router.route('/')

  .get(columnistsController.getAllColumnists);

module.exports = router;

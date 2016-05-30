var express = require('express');

var newsController  = require('../../controllers/news');
var authenticator      = require('../authenticator');

var router = express.Router();

router.route('/')

  .get(authenticator, newsController.getAllNews)

  .post(authenticator, newsController.createNews);

router.route('/:id')

  .get(authenticator,newsController.getNewsById)

  .put(authenticator, newsController.updateNews);

router.route('/:id/status/published')

  .put(authenticator, newsController.updateStatus);


router.route('/:id/unpublish')
  .post(authenticator, newsController.unpublish);

module.exports = router;

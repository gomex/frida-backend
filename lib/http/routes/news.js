var express = require('express');

var newsController  = require('../../controllers/news');
var simpleAuth      = require('../simple-auth');

var router = express.Router();

router.route('/')

  .get(simpleAuth, newsController.getAllNews)

  .post(simpleAuth, newsController.createNews);

router.route('/:id')

  .get(simpleAuth,newsController.getNewsById)

  .put(simpleAuth, newsController.updateNews);

router.route('/:id/status/published')

  .put(simpleAuth, newsController.updateStatus);


router.route('/:id/unpublish')
  .post(simpleAuth, newsController.unpublish);

module.exports = router;

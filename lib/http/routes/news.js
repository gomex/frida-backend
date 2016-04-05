var express = require('express');

var newsController  = require('../../controllers/news');
var simpleAuth      = require('../simple-auth');

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

router.route('/')

  .get(simpleAuth(EDITOR), newsController.getAllNews)

  .post(simpleAuth(EDITOR), newsController.createNews);

router.route('/:id')

  .get(simpleAuth(EDITOR),newsController.getNewsById)

  .put(simpleAuth(EDITOR), newsController.updateNews);

router.route('/:id/status/published')

  .put(simpleAuth(EDITOR), newsController.updateStatus);

module.exports = router;

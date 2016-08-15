var express = require('express');

var newsController  = require('../../controllers/news');

var router = express.Router();

router.route('/')

  .get(newsController.getAllNews)

  .post(newsController.createNews);

router.route('/:id')

  .get(newsController.getNewsById)

  .put(newsController.updateNews)

  .delete(newsController.remove);

router.route('/:id/status/published')

  .put(newsController.updateStatus);


router.route('/:id/unpublish')
  .post(newsController.unpublish);

module.exports = router;

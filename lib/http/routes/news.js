var express = require('express');
var controller = require('../../controllers/news');
var router = express.Router();

router.route('/')
  .get(controller.getAllNews)
  .post(controller.createNews);

router.route('/:id')
  .get(controller.getNewsById)
  .put(controller.updateNews)
  .delete(controller.remove);

router.route('/:id/publish')
  .post(controller.publish);

router.route('/:id/unpublish')
  .post(controller.unpublish);

router.route('/republish')
  .post(controller.republishAll);

module.exports = router;

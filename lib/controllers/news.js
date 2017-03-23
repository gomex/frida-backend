var _ = require('underscore');

var helper = require('./helper');
var News = require('../models/news');
var publisher = require('../services/publisher');
var republisher = require('../services/publisher/republisher');
var worker = require('../services/publisher/worker');
var queryBuilder = require('../models/news/query-builder');

var FRIDA_FRONTEND_NEWS_LIMIT = 50;

function sanitizeNewsForCreateOrUpdate(news) {
  var newsClone = Object.assign({}, news);
  if(_.isEmpty(newsClone.metadata.cover) || _.isEmpty(newsClone.metadata.cover.link)) {
    newsClone.metadata.cover = null;
  }

  News.removeLineSeparator(newsClone);

  return newsClone;
}

var getAllNews = function(req, res, next) {
  var query = queryBuilder.build(req.query);
  var deleteFilter = [{'status': {$ne: 'deleted'}}];

  News.find(query).and(deleteFilter).sort('-created_at').limit(FRIDA_FRONTEND_NEWS_LIMIT).exec(function(err, result) {
    if (err) return next({status: 500, error: err});

    helper.sendResponse(res, 200, result);
  });
};

var createNews = function(req, res, next) {
  var attributes = sanitizeNewsForCreateOrUpdate(req.body);
  attributes.status = 'draft';

  var news = new News(attributes);

  news.save(news, function(err) {
    if (err) return next({status: 500, error: err});

    helper.sendResponse(res, 201, { id : news._id.toString() });
  });
};

var getNewsById =  function(req, res, next) {
  News.findById(req.params.id, function(err, news) {
    if (err) return next({status: 500, error: err});
    if (!news) return next({status: 404, error: 'Not Found'});

    helper.sendResponse(res, 200, news);
  });
};

var updateNews = function(req, res, next) {
  News.findById(req.params.id, (err, news) => {
    if (err) return next({status: 500, error: err});
    if (!news) return next({status: 404, error: 'Not Found'});

    news.updateSanitized(req.body, (err, updated) => {
      if (err) return next({status: 500, error: err});

      helper.sendResponse(res, 200, updated);
    });
  });
};

var publish = function(req, res, next) {
  News.findById(req.params.id, function(err, news) {
    if (err) return next({status: 500, error: err});
    if (!news) return next({status: 404, error: 'Not Found'});

    worker.publishLater([news], true, (err) => {
      if (err) return next({status: 500, error: err});

      News.findById(req.params.id, (err, updatedNews) => {
        if (err) return next({status: 500, error: err});

        helper.sendResponse(res, 202, updatedNews);
      });
    });
  });
};

var republishAll = function(_req, res, next) {
  republisher.publish((err) => {
    if (err) return next({status: 500, error: err});

    helper.sendResponse(res, 202);
  });
};

var unpublish = function(req, res, next) {
  News.findById(req.params.id, function(err, news) {
    if (err) return next({status: 500, error: err});
    if (!news) return next({status: 404, error: 'Not Found'});

    worker.unpublishLater(news, (err, updatedNews) => {
      if (err) return next({status: 500, error: err});

      helper.sendResponse(res, 202, updatedNews);
    });
  });
};

var remove = function(req, res, next) {
  News.findById(req.params.id, function(err, news) {
    if (err) return next({status: 500, error: err});
    if (!news) return next({status: 404, error: 'Not Found'});

    publisher.remove(news, function(err, news) {
      if (err) return next({status: 500, error: err});

      helper.sendResponse(res, 200, news);
    });
  });
};

module.exports = {
  unpublish: unpublish,
  publish: publish,
  updateNews: updateNews,
  getNewsById: getNewsById,
  createNews: createNews,
  getAllNews: getAllNews,
  remove: remove,
  republishAll: republishAll
};

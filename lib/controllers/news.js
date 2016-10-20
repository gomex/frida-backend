var _ = require('underscore');

var helper = require('./helper');
var News = require('../models/news');
var publisher = require('../models/publisher');
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

var getAllNews = function(req, res) {
  var query = queryBuilder.build(req.query);
  var deleteFilter = [{'status': {$ne: 'deleted'}}];

  News.find(query).and(deleteFilter).sort('-created_at').limit(FRIDA_FRONTEND_NEWS_LIMIT).exec(function(err, result) {
    helper.sendResponse(res, 200, result);
  });
};

var createNews = function(req, res) {
  var attributes = sanitizeNewsForCreateOrUpdate(req.body);
  attributes.status = 'draft';

  var news = new News(attributes);

  news.save(news, function(_err) {
    helper.sendResponse(res, 201, { id : news._id.toString() });
  });
};

var getNewsById =  function(req, res) {
  News.findById(req.params.id, function(err, result) {
    helper.sendResponse(res, 200, result);
  });
};

var updateNews = function(req, res) {
  News.findById(req.params.id, (err, news) => {
    news.updateSanitized(req.body, () => {
      helper.sendResponse(res, 200, { id : req.params.id });
    });
  });
};

var updateStatus = function(req, res) {
  News.findById(req.params.id, function(err, news) {
    publisher.publish(news, function(_err, updatedNews) {
      helper.sendResponse(res, 202, updatedNews);
    });
  });
};

var unpublish = function(req, res) {
  News.findById(req.params.id, function(err, news) {
    if (err) {
      helper.sendError(res, 404, err);
      return;
    }
    publisher.unpublish(news, function(err, news) {
      if (err) {
        helper.sendError(res, 500, err);
        return;
      }
      helper.sendResponse(res, 200, news);
    });
  });
};

var remove = function(req, res){
  News.findById(req.params.id, function(err, news) {
    if(err) {
      helper.sendError(res, 404, err);
      return;
    }
    publisher.remove(news, function(err, news) {
      if (err) {
        helper.sendError(res, 500, err);
        return;
      }
      helper.sendResponse(res, 200, news);
    });
  });
};

module.exports = {
  unpublish: unpublish,
  updateStatus: updateStatus,
  updateNews: updateNews,
  getNewsById: getNewsById,
  createNews: createNews,
  getAllNews: getAllNews,
  remove: remove
};

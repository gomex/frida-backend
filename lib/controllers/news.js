var _                 = require('underscore');

var controllersHelper = require('./controllers-helper');
var News = require('../models/news');
var publisher = require('../models/publisher');

var FRIDA_FRONTEND_NEWS_LIMIT = 50;

function removeServerManagedFields(news) {
  delete news.metadata.url;
  delete news.status;
  delete news.created_at;
  delete news.published_at;

  return news;
}

function sanitizeNewsForCreateOrUpdate(news) {
  if(_.isEmpty(news.metadata.cover) || _.isEmpty(news.metadata.cover.link)) {
    news.metadata.cover = null;
  }

  news = removeServerManagedFields(news);

  return news;
}

var getAllNews = function(req, res) {
  var query = {};
  if (req.query.q) {
    query['metadata.title'] =  new RegExp(req.query.q, 'i');
  }

  News.find(query).sort('-created_at').limit(FRIDA_FRONTEND_NEWS_LIMIT).exec(function(err, result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var createNews = function(req, res) {
  var news     = sanitizeNewsForCreateOrUpdate(req.body);

  news.status = 'draft';
  news.created_at = Date.now();
  news.updated_at = Date.now();

  news = new News(news);

  news.save(news, function(_err) {
    controllersHelper.buildSendResponse(res, 201, { id : news._id.toString() });
  });
};

var getNewsById =  function(req, res) {
  News.findById(req.params.id, function(err, result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var updateNews = function(req, res) {
  News.findById(req.params.id, function(err, news){
    var updatedNews = sanitizeNewsForCreateOrUpdate(req.body);

    updatedNews.metadata.url = news.metadata.url; //once set on publish news path should never change
    updatedNews.updated_at = Date.now();

    var updatedItem = _.clone(updatedNews);
    delete updatedItem._id;

    News.findOneAndUpdate({_id: req.params.id}, {$set: updatedItem}, {new: true}, function(_err) {
      controllersHelper.buildSendResponse(res, 200, { id : req.params.id });
    });
  });
};

var updateStatus = function(req, res) {
  News.findById(req.params.id, function(err, news) {
    publisher.publish(news, function(_err, updatedNews) {
      controllersHelper.buildSendResponse(res, 202, updatedNews);
    });
  });
};

var unpublish = function(req, res) {
  News.findById(req.params.id, function(err, news) {
    if (err) {
      controllersHelper.buildSendError(res, 404, err);
      return;
    }
    publisher.unpublish(news, function(err, news) {
      if (err) {
        controllersHelper.buildSendError(res, 500, err);
        return;
      }
      controllersHelper.buildSendResponse(res, 200, news);
    });
  });
};

module.exports = {
  unpublish: unpublish,
  updateStatus: updateStatus,
  updateNews: updateNews,
  getNewsById: getNewsById,
  createNews: createNews,
  getAllNews: getAllNews
};

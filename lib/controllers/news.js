var _                 = require('underscore');

var controllersHelper = require('./controllers-helper');
var newsRepository    = require('../news/news-repository');
var publisher = require('../news/publisher');

function removeServerManagedFields(news) {
  delete news.metadata.url;
  delete news.status;
  delete news.created_at;
  delete news.published_at;

  return news;
}

function sanitizeNewsForCreateOrUpdate(news) {
  if (typeof news.metadata === 'string') {
    news.metadata = JSON.parse(news.metadata);
  }

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

  newsRepository.getAll(query, function(err, result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var createNews = function(req, res) {
  var news     = sanitizeNewsForCreateOrUpdate(req.body);

  news.status = 'draft';
  news.created_at = Date.now();

  newsRepository.insert(news, function(err, result) {
    controllersHelper.buildSendResponse(res, 201,{ id : result });
  });
};

var getNewsById =  function(req, res) {
  var id = req.params.id;
  newsRepository.findById(id, function(err, result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var updateNews = function(req, res) {
  newsRepository.findById(req.params.id, function(err, news){
    var updatedNews = sanitizeNewsForCreateOrUpdate(req.body);

    updatedNews.metadata.url = news.metadata.url; //once set on publish news path should never change

    newsRepository.updateById(req.params.id, updatedNews, function(_err) {
      controllersHelper.buildSendResponse(res, 200, { id : req.params.id });
    });
  });
};

var updateStatus = function(req, res) {
  newsRepository.findById(req.params.id, function(err, news) {

    news = news.toObject();
    publisher.publish(news, function(_err) {
      var response = { path : news.metadata.url };
      controllersHelper.buildSendResponse(res, 202, response);
    });
  });
};

var unpublish = function(req, _res) {
  newsRepository.findById(req.params.id, function(err, news) {
    news = news.toObject();

    publisher.unpublish(news, function(_err) {
      controllersHelper.buildSendResponse(news, 200, {});
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

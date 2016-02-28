var controllersHelper = require('./controllers-helper');
var hexo              = require('../publisher/hexo');
var newsRepository    = require('../news/news-repository');
var newsUtil          = require('../news/news-util');

var getAllNews = function(req, res) {
  newsRepository.getAll(function(result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var createNews = function(req, res) {
  var news     = newsUtil.prepare(req.body);
  newsRepository.insert(news, function(result) {
    controllersHelper.buildSendResponse(res, 201,{ id : result });
  });
};

var getNewsById =  function(req, res) {
  var id = req.params.id;
  newsRepository.findById(id, function(result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var updateNews = function(req, res) {
  newsRepository.findById(req.params.id, function(news){
    var metadata = JSON.parse(req.body.metadata);

    news.body = req.body.body;
    news.metadata = metadata;

    newsRepository.updateById(req.params.id, news, function(result) {
      controllersHelper.buildSendResponse(res, 200, { id : result });
    });
  });
};

var updateStatus = function(req, res) {
  newsRepository.findById(req.params.id, function(news){

    if(req.params.status !== 'published') {
      controllersHelper.buildSendResponse(res, 200);
    } else {
      news.published_at = news.published_at || new Date();
      news.status = req.params.status;

      hexo.publish(news.toObject(), function(postPath) {
        newsRepository.updateById(req.params.id, news, function() {
          hexo.updateHome(news.metadata.edition, function() {
            controllersHelper.buildSendResponse(res, 202, {path : postPath});
          });
        });
      });
    }
  });
};

module.exports = {
  updateStatus: updateStatus,
  updateNews: updateNews,
  getNewsById: getNewsById,
  createNews: createNews,
  getAllNews: getAllNews
};

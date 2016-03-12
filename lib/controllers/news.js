var async             = require('async');
var controllersHelper = require('./controllers-helper');
var hexo              = require('../publisher/hexo');
var newsRepository    = require('../news/news-repository');
var newsUtil          = require('../news/news-util');

var getAllNews = function(req, res) {
  newsRepository.getAll(function(err, result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var createNews = function(req, res) {
  var news     = newsUtil.prepare(req.body);
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
    var metadata = JSON.parse(req.body.metadata);

    news.body = req.body.body;
    news.metadata = metadata;

    newsRepository.updateById(req.params.id, news, function(_err) {
      controllersHelper.buildSendResponse(res, 200, { id : req.params.id });
    });
  });
};

var updateStatus = function(req, res) {
  if(req.params.status !== 'published') {
    controllersHelper.buildSendResponse(res, 200);
  } else {
    newsRepository.findById(req.params.id, function(err, news){

      news.published_at = news.published_at || new Date();
      news.status = req.params.status;

      var operations = [];

      if(news.metadata.layout !== 'photo_caption') {
        operations.push(async.apply(hexo.publish, news.toObject()));
      }
      operations.push(async.apply(newsRepository.updateById, req.params.id, news));
      operations.push(hexo.updateHome);


      async.series(operations, function(_err, result) {
        var response;
        if(result[0]) {
          response = { path : result[0] };
        }
        controllersHelper.buildSendResponse(res, 202, response);
      });
    });
  }
};

module.exports = {
  updateStatus: updateStatus,
  updateNews: updateNews,
  getNewsById: getNewsById,
  createNews: createNews,
  getAllNews: getAllNews
};

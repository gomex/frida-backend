var async             = require('async');
var moment            = require('moment');
var path              = require('path');
var slug              = require('slug');

var controllersHelper = require('./controllers-helper');
var hexo              = require('../publisher/hexo');
var newsRepository    = require('../news/news-repository');
var newsUtil          = require('../news/news-util');

function getHTTPPathFor(news) {
  var publishedAt = moment(news.published_at);
  var postDir = publishedAt.format('YYYY/MM/DD');
  var slugTitle = slug(news.metadata.title, { lower: true });

  return path.join('/', postDir, slugTitle, '/');
}

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
    var metadata;
    // this is necessary for compatibility with old frida
    if ((typeof req.body.metadata) == 'string') {
      metadata = JSON.parse(req.body.metadata);
    } else {
      metadata = req.body.metadata;
    }

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

      news.metadata.url = getHTTPPathFor(news);
      news.published_at = news.published_at || new Date();
      news.status = req.params.status;

      var operations = [];

      if(news.metadata.layout !== 'photo_caption') {
        operations.push(async.apply(hexo.publish, news.toObject()));
      }
      operations.push(async.apply(newsRepository.updateById, req.params.id, news));
      if(news.metadata.layout !== 'photo_caption') {
        var areaName = (news.metadata.layout === 'column') ? news.metadata.layout : news.metadata.area;
        operations.push(async.apply(hexo.updateAreaPage, areaName));
      }
      operations.push(hexo.updateHomePage);

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

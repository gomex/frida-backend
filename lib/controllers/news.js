var _                 = require('underscore');
var async             = require('async');
var moment            = require('moment');
var path              = require('path');
var slug              = require('slug');

var controllersHelper = require('./controllers-helper');
var hexo              = require('../publisher/hexo');
var newsRepository    = require('../news/news-repository');

function getHTTPPathFor(news) {
  var publishedAt = moment(news.published_at);
  var postDir = publishedAt.format('YYYY/MM/DD');
  var slugTitle = slug(news.metadata.title, { lower: true });

  return path.join('/', postDir, slugTitle, '/');
}

function sanitizeNewsForCreateOrUpdate(news) {
  if (typeof news.metadata === 'string') {
    news.metadata = JSON.parse(news.metadata);
  }

  if(_.isEmpty(news.metadata.cover) || _.isEmpty(news.metadata.cover.link)) {
    delete news.metadata.cover;
  }

  delete news.metadata.url;

  news.status = news.status || 'draft';
  news.created_at = news.created_at || Date.now();

  return news;
}

var getAllNews = function(req, res) {
  newsRepository.getAll(function(err, result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

var createNews = function(req, res) {
  var news     = sanitizeNewsForCreateOrUpdate(req.body);
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
    news = sanitizeNewsForCreateOrUpdate(req.body);

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

      news.metadata.url = news.metadata.url || getHTTPPathFor(news);
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

      async.series(operations, function(_err) {
        var response = { path : news.metadata.url };
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

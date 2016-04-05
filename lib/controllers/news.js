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
  newsRepository.getAll(function(err, result) {
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

function doNothing(cb) { cb(); }

function publishNewsDataFile(news) {
  if(news.metadata.layout !== 'photo_caption') {
    return async.apply(hexo.publish, news);
  }

  return doNothing;
}

function publishAreaDataFile(news) {
  if(news.metadata.layout !== 'photo_caption') {
    var areaName = (news.metadata.layout === 'column') ? news.metadata.layout : news.metadata.area;
    return async.apply(hexo.updateAreaPage, areaName);
  }

  return doNothing;
}

function updateStatusOnDatabase(newsId, news) {
  return async.apply(newsRepository.updateById, newsId, news);
}

var updateStatus = function(req, res) {
  newsRepository.findById(req.params.id, function(err, news) {

    news = news.toObject();
    news.metadata.url = news.metadata.url || getHTTPPathFor(news);
    news.published_at = news.published_at || new Date();
    news.status = 'published';

    var pipeline = [];

    pipeline.push(publishNewsDataFile(news));
    pipeline.push(updateStatusOnDatabase(req.params.id, news));
    pipeline.push(publishAreaDataFile(news));
    pipeline.push(hexo.updateHomePage);

    async.series(pipeline, function(_err) {
      var response = { path : news.metadata.url };
      controllersHelper.buildSendResponse(res, 202, response);
    });
  });
};

module.exports = {
  updateStatus: updateStatus,
  updateNews: updateNews,
  getNewsById: getNewsById,
  createNews: createNews,
  getAllNews: getAllNews
};

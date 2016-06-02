'use strict';

var moment = require('moment');
var slug = require('slug');
var path = require('path');
var async = require('async');
var hexo = require('../publisher/hexo');
var newsRepository = require('../news/news-repository');
var _ = require('underscore');
var tabloids = require('../news/tabloid');

function doNothing(cb) { cb(); }

function publishNewsDataFile(news, callback) {
  if (news.metadata.layout === 'photo_caption') {
    return callback();
  }

  async.waterfall([
    function(callback) {
      if (news.metadata.layout == 'tabloid') {
        tabloids.findNews(news, function(err, list) {
          news.news = list;
          callback(err, news);
        });
      } else {
        callback(null, news);
      }
    }
  ], function (err, news) {
    if (err) {
      return callback(err);
    }
    hexo.publish(news, callback);
  });
}

function updateStatusOnDatabase(newsId, news) {
  return async.apply(newsRepository.updateById, newsId, news);
}

function publishAreaDataFile(news) {
  var newsTypesWithArea = ['post', 'column'];
  if(_.contains(newsTypesWithArea, news.metadata.layout)) {
    var areaName = (news.metadata.layout === 'column') ? news.metadata.layout : news.metadata.area;
    return async.apply(hexo.updateAreaPage, areaName);
  }

  return doNothing;
}

function getHTTPPathFor(news) {
  var publishedAt = moment(news.published_at);
  var postDir = publishedAt.format('YYYY/MM/DD');
  var slugTitle = slug(news.metadata.title, { lower: true });

  return path.join('/', postDir, slugTitle, '/');
}

function newsHasChanged(news) {
  return news.updated_at.getTime() >= news.published_at.getTime();
}

var publish = function(news, callback) {
  news.published_at = news.published_at || new Date();
  news.updated_at = news.updated_at || new Date();

  if((news.status === 'draft') || newsHasChanged(news)) {
    news.status = 'published';
    news.metadata.url = news.metadata.url || getHTTPPathFor(news);

    var pipeline = [];

    pipeline.push(async.apply(publishNewsDataFile, news));
    pipeline.push(updateStatusOnDatabase(news._id, news));
    pipeline.push(publishAreaDataFile(news));
    pipeline.push(hexo.updateHomePage);

    async.series(pipeline, function(err) {
      callback(err, news);
    });
  } else {
    callback(null, news);
  }
};

var unpublish = function(news, callback) {
  news.status = 'draft';

  var pipeline = [];

  pipeline.push(updateStatusOnDatabase(news._id, news));
  pipeline.push(async.apply(hexo.unpublish, news));
  pipeline.push(publishAreaDataFile(news));
  pipeline.push(hexo.updateHomePage);

  async.series(pipeline, function(err, results) {
    callback(err, results[0]);
  });
};

module.exports = {
  publish: publish,
  unpublish: unpublish
};

'use strict';

var moment = require('moment');
var slug = require('slug');
var path = require('path');
var async = require('async');
var hexo = require('../publisher/hexo');
var _ = require('underscore');
var tabloids = require('../models/tabloids');

function doNothing(cb) { cb(); }

function ifHasTabloidPublish(news, callback) {
  if (news.metadata.layout !== 'tabloid_news') {
    return callback();
  }

  tabloids.findTabloid(news, (err, tabloid) => {
    if (err || !tabloid) {
      return callback(err, null);
    }

    tabloid.status = 'draft';
    publish(tabloid, (err) => {
      callback(err, news);
    });
  });
}

function ifTabloidEnrichesWithNews(news, callback) {
  if (!news.isTabloid()) {
    return callback();
  }

  tabloids.findNews(news, (err, list) => {
    news.news = list;
    callback(err, null);
  });
}

function publishNewsDataFile(news, callback) {
  if (news.metadata.layout === 'photo_caption' || news.metadata.layout === 'advertising') {
    return callback();
  }
  hexo.publish(news, callback);
}

function publishAreaDataFile(news) {
  var newsTypesWithArea = ['post', 'column'];
  if(_.contains(newsTypesWithArea, news.metadata.layout)) {
    var areaName = (news.metadata.layout === 'column') ? news.metadata.layout : news.metadata.area;
    return async.apply(hexo.updateAreaPage, areaName);
  }

  return doNothing;
}

function publishLastNewsDataFile(news) {
  if (news.metadata.layout === 'post'
    || news.metadata.layout === 'column'
    || news.metadata.layout === 'tabloid_news') {

    return async.apply(hexo.updateAreaPage, 'ultimas_noticias');
  }

  return doNothing;
}

function getHTTPPathFor(news) {
  var publishedAt = moment(news.published_at);
  var postDir = publishedAt.format('YYYY/MM/DD');
  var slugTitle = slug(news.metadata.title, { lower: true });

  return path.join('/', postDir, slugTitle, '/');
}

var publish = function(news, callback) {
  news.published_at = news.published_at || new Date();
  news.updated_at = news.updated_at || new Date();

  if ((news.status === 'draft') || (news.status === 'edited')) {
    news.status = 'published';
    news.metadata.url = news.metadata.url || getHTTPPathFor(news);

    var pipeline = [];

    pipeline.push(news.save);
    pipeline.push(async.apply(ifTabloidEnrichesWithNews, news));
    pipeline.push(async.apply(publishNewsDataFile, news));
    pipeline.push(async.apply(ifHasTabloidPublish, news));
    pipeline.push(publishAreaDataFile(news));
    pipeline.push(publishLastNewsDataFile(news));
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

  pipeline.push(async.apply(news.save));
  pipeline.push(async.apply(hexo.unpublish, news));
  pipeline.push(async.apply(ifHasTabloidPublish, news));
  pipeline.push(publishAreaDataFile(news));
  pipeline.push(publishLastNewsDataFile(news));
  pipeline.push(hexo.updateHomePage);

  async.series(pipeline, function(err) {
    callback(err, news);
  });
};

module.exports = {
  publish: publish,
  unpublish: unpublish
};

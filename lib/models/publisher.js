'use strict';

var moment = require('moment');
var slug = require('slug');
var path = require('path');
var async = require('async');
var hexo = require('../publisher/hexo');
var _ = require('underscore');
var tabloids = require('../models/news/tabloids');
var photoCaptions = require('../models/news/photo-captions');
var News = require('../models/news');

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

function enrichesWithRelatedPhotoCaptions(news, callback) {
  if (!news.isPhotoCaption()) {
    return callback();
  }

  photoCaptions.getRelateds(news, (err, list) => {
    news.related_photo_captions = list;
    callback(err);
  });
}

function enrichesWithRelatedNews(news, callback) {
  if (!news.isPost()) {
    return callback();
  }

  news.populate('related_news', callback);
}

function enrichesWithOtherNews(news, callback) {
  if (!news.isPost()) {
    return callback();
  }

  News.findOtherNews(news, (err, list) => {
    news.other_news = list;
    callback(err);
  });
}

function ifTabloidEnrichesWithNews(news, callback) {
  if (!news.isTabloid()) {
    return callback();
  }

  tabloids.findNews(news, (err, list) => {
    news.news = list;
    callback(err);
  });
}

function ifPhotoCaptionPublishesList(news, callback) {
  if (!news.isPhotoCaption()) {
    return callback();
  }

  photoCaptions.getList((err, list) => {
    if (err) return callback(err);

    hexo.publishList(list, callback);
  });
}

function ifInNewsAdvertisingPublishesDataFile(news, callback) {
  if (!news.isInNewsAdvertising()) {
    return callback();
  }
  hexo.updateAdvertisingData(news, callback);
}

function publishNewsDataFile(news, callback) {
  if (news.isAdvertising()) {
    return callback();
  }
  hexo.publish(news, callback);
}

function publishAreaDataFile(news) {
  var newsTypesWithArea = ['post', 'column'];
  if(_.contains(newsTypesWithArea, news.metadata.layout)) {
    var areaName = (news.isColumn()) ? news.metadata.layout : news.metadata.area;
    return async.apply(hexo.updateAreaPage, areaName);
  }

  return doNothing;
}

function publishRadioDataFile(news) {
  if (news.isPost()) {
    return async.apply(hexo.updateAreaPage, 'radio');
  }

  return doNothing;
}

function publishLastNewsDataFile(news) {
  if (news.isPost()
    || news.isColumn()
    || news.isTabloidNews()) {

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

  if (news.isDraft() || news.isChanged()) {
    news.status = 'published';
    news.metadata.url = news.metadata.url || getHTTPPathFor(news);

    var pipeline = [
      news.save,
      async.apply(ifTabloidEnrichesWithNews, news),
      async.apply(enrichesWithRelatedNews, news),
      async.apply(enrichesWithRelatedPhotoCaptions, news),
      async.apply(enrichesWithOtherNews, news),
      async.apply(publishNewsDataFile, news),
      async.apply(ifHasTabloidPublish, news),
      async.apply(ifPhotoCaptionPublishesList, news),
      async.apply(ifInNewsAdvertisingPublishesDataFile, news),
      publishAreaDataFile(news),
      publishRadioDataFile(news),
      publishLastNewsDataFile(news),
      hexo.publishStaticFiles,
      hexo.updateHomePage
    ];

    async.series(pipeline, function(err) {
      callback(err, news);
    });
  } else {
    callback(null, news);
  }
};

var unpublish = function(news, callback) {
  news.status = 'draft';

  var pipeline = [
    async.apply(news.save),
    async.apply(hexo.unpublish, news),
    async.apply(ifHasTabloidPublish, news),
    async.apply(ifInNewsAdvertisingPublishesDataFile, news),
    publishAreaDataFile(news),
    publishRadioDataFile(news),
    publishLastNewsDataFile(news),
    hexo.updateHomePage
  ];

  async.series(pipeline, function(err) {
    callback(err, news);
  });
};

var remove = function(news, callback){
  if(news.isDraft()) {
    news.status = 'deleted';
    news.save(callback);
  } else {
    callback();
  }
};

module.exports = {

  publish: publish,
  unpublish: unpublish,
  remove: remove
};

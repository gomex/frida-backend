'use strict';

var moment = require('moment');
var slug = require('slug');
var path = require('path');
var async = require('async');
var hexo = require('../publisher/hexo');
var _ = require('underscore');
var tabloids = require('../models/news/tabloids');
var advertisings = require('../models/news/advertisings');
var photoCaptions = require('../models/news/photo-captions');
var News = require('../models/news');
var radioAgencia = require('../models/home/radio-agencia');
var bdf = require('../models/home/bdf');

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

function enrichesWithLatestRadioNews(home, callback) {
  if(!home.isRadioAgencia()) {
    return callback();
  }

  radioAgencia.getRadioNewsList(home.featured_01, (err, list) => {
    home.latest_news = list;
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

function ifAdvertising(news, callback) {
  if (!news.isAdvertising()) {
    return callback();
  }

  advertisings.getList((err, list) => {
    if (err) return callback(err);

    hexo.updateAdvertisingData(list, callback);
  });
}

function publishNewsDataFile(news, callback) {
  if (news.isAdvertising()) {
    return callback();
  }
  hexo.publish(news, callback);
}

function publishAreaDataFile(news) {
  var newsTypesWithArea = ['post', 'column', 'tabloid_news'];
  if(news.metadata.area !== 'nenhuma' && _.contains(newsTypesWithArea, news.metadata.layout)) {
    var areaName = (news.isColumn()) ? news.metadata.layout : news.metadata.area;
    return async.apply(hexo.updateAreaPage, areaName);
  }

  return doNothing;
}

function publishRadioDataFile(news) {
  if (news.isPost() || news.isTabloidNews()) {
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
  if ((!news.isDraft()) && (!news.isChanged())) {
    return callback({error: 'It is not allowed to publish news with this state.', news});
  }

  news.status = 'published';
  news.published_at = news.published_at || new Date();
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
    async.apply(ifAdvertising, news),
    publishAreaDataFile(news),
    publishRadioDataFile(news),
    publishLastNewsDataFile(news),
    hexo.publishStaticFiles
  ];

  async.series(pipeline, function(err) {
    callback(err, news);
  });
};

var unpublish = function(news, callback) {
  news.status = 'draft';

  var pipeline = [
    async.apply(news.save),
    async.apply(hexo.unpublish, news),
    async.apply(ifHasTabloidPublish, news),
    async.apply(ifAdvertising, news),
    publishAreaDataFile(news),
    publishRadioDataFile(news),
    publishLastNewsDataFile(news)
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

var enrichesBDF = (home, callback) => {
  async.series([
    (callback) => {
      bdf.getLastNews((err, list) => {
        home.last_news = list;
        callback(err);
      });
    },
    (callback => {
      bdf.getMostRead((err, list) => {
        home.most_read = list;
        callback(err);
      });
    })
  ], callback);
};

var enrichesHome = (home, callback) => {
  if (home.isBDF()) {
    enrichesBDF(home, callback);
  } else if (home.isRadioAgencia()) {
    enrichesWithLatestRadioNews(home, callback);
  } else {
    callback();
  }
};

var publishHome = (home, callback) => {
  var pipeline = [
    (cb) => home.populateAllFields(cb),
    async.apply(enrichesHome, home),
    async.apply(hexo.publishHome, home)
  ];

  async.series(pipeline, callback);
};

module.exports = {
  publish: publish,
  unpublish: unpublish,
  publishHome: publishHome,
  remove: remove
};

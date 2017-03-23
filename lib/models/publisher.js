'use strict';

var async = require('async');
var hexo = require('../publisher/hexo');
var site = require('../publisher/site');
var tabloids = require('../models/news/tabloids');
var News = require('../models/news');
var photoCaptions = require('./news/photo-captions');

function ifHasTabloidPublish(news, callback) {
  if (!news.isTabloidNews()) {
    return callback();
  }

  tabloids.findTabloid(news, (err, tabloid) => {
    if (err || !tabloid) {
      return callback(err, null);
    }

    tabloid.status = 'draft';
    tabloid.save((err) => {
      if (err) return callback(err);
      publishNew([tabloid], (err) => callback(err, news));
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
    var pipeline = [];
    for(var i=0; i<list.length; i++) {
      pipeline.push(async.apply(ifTabloidNewsEnrichesWithTabloid, list[i]));
      pipeline.push(async.apply(publishNewsDataFile, list[i]));
    }
    async.series(pipeline, callback);
  });
}

function ifTabloidNewsEnrichesWithTabloid(news, callback) {
  if (!news.isTabloidNews()) {
    return callback();
  }

  tabloids.findTabloid(news, (err, tabloid) => {
    if (err || !tabloid) {
      return callback(err, null);
    }

    news.issuu = tabloid.metadata.url;
    news.edition = tabloid.edition;
    callback(err);
  });
}

function publishNewsDataFile(news, callback) {
  if (news.isAdvertising()) {
    return callback();
  }
  hexo.publish(news, callback);
}

var isPublishable = function(news) {
  return news.isDraft() || news.isChanged() || news.isPublishing();
};

var publishOne = function(news, callback) {
  if (!isPublishable(news)) {
    return callback({error: 'It is not allowed to publish news with this state.', news});
  }

  news.status = 'published';
  news.published_at = news.published_at || new Date();
  news.generateUrl();

  var pipeline = [
    (callback) => news.save(callback),
    async.apply(ifTabloidEnrichesWithNews, news),
    async.apply(ifTabloidNewsEnrichesWithTabloid, news),
    async.apply(enrichesWithRelatedNews, news),
    async.apply(enrichesWithRelatedPhotoCaptions, news),
    async.apply(enrichesWithOtherNews, news),
    async.apply(publishNewsDataFile, news),
    async.apply(ifHasTabloidPublish, news)
  ];

  async.series(pipeline, function(err) {
    callback(err, news);
  });
};

function publishNew(news, callback) {
  console.log('PUBLISHER', 'publishing', (news || []).length);
  async.mapSeries(news, publishOne, callback);
}

function unpublishOne(news, callback) {
  news.status = 'draft';

  var pipeline = [
    (callback) => news.save(callback),
    async.apply(site.remove, news.metadata.url),
    async.apply(ifTabloidEnrichesWithNews, news),
    async.apply(ifHasTabloidPublish, news),
  ];

  async.series(pipeline, function(err) {
    callback(err, news);
  });
}

function unpublishNew(news, callback) {
  console.log('PUBLISHER', 'unpublishing', (news || []).length);

  News.find().where('_id').in(news).exec((err, results) => {
    async.mapSeries(results, unpublishOne, callback);
  });
}

var remove = function(news, callback){
  if(news.isDraft()) {
    news.status = 'deleted';
    news.save(callback);
  } else {
    callback();
  }
};

module.exports = {
  publishNew: publishNew,
  unpublishNew: unpublishNew,
  publishOne: publishOne,
  unpublishOne: unpublishOne,
  remove: remove
};

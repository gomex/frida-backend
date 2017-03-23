'use strict';

var async = require('async');
var hexo = require('../publisher/hexo');
var site = require('../publisher/site');
var tabloids = require('../models/news/tabloids');
var News = require('../models/news');
var photoCaptions = require('./news/photo-captions');
var apply = require('async').apply;

function enrichesNews(news, callback) {
  if(news.isPost()) {
    async.parallel([
      apply(enrichesWithRelatedNews, news),
      apply(enrichesWithOtherNews, news),
    ], callback);
  } else if (news.isTabloid()) {
    ifTabloidEnrichesWithNews(news, callback);
  } else if (news.isTabloidNews()) {
    ifTabloidNewsEnrichesWithTabloid(news, callback);
  } else if (news.isPhotoCaption()) {
    enrichesWithRelatedPhotoCaptions(news, callback);
  } else {
    callback();
  }
}

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
      publish(tabloid, (err) => callback(err, news));
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
      pipeline.push(apply(ifTabloidNewsEnrichesWithTabloid, list[i]));
      pipeline.push(apply(publishNewsDataFile, list[i]));
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

var publish = function(news, callback) {
  if (!isPublishable(news)) {
    return callback({error: 'It is not allowed to publish news with this state.', news});
  }

  news.status = 'published';
  news.published_at = news.published_at || new Date();
  news.generateUrl();

  var pipeline = [
    (callback) => news.save(callback),
    apply(enrichesNews, news),
    apply(publishNewsDataFile, news),
    apply(ifHasTabloidPublish, news)
  ];

  async.series(pipeline, function(err) {
    callback(err, news);
  });
};

function unpublish(news, callback) {
  news.status = 'draft';

  var pipeline = [
    (callback) => news.save(callback),
    apply(site.remove, news.metadata.url),
    apply(ifTabloidEnrichesWithNews, news),
    apply(ifHasTabloidPublish, news),
  ];

  async.series(pipeline, function(err) {
    callback(err, news);
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
  publish: publish,
  unpublish: unpublish,
  remove: remove
};

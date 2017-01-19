'use strict';

var async = require('async');
var hexo = require('../publisher/hexo');
var _ = require('underscore');
var tabloids = require('../models/news/tabloids');
var photoCaptions = require('../models/news/photo-captions');
var News = require('../models/news');
var radioAgencia = require('../models/home/radio-agencia');
var bdf = require('../models/home/bdf');
var Home = require('../models/home');

function doNothing(cb) { cb(); }

function ifHasTabloidPublish(news, callback) {
  if (!news.isTabloidNews()) {
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
  var excludedNewsIds = _.chain([
    home.featured_01,
    home.column_01,
    home.service_01,
    home.service_02,
    home.service_03,
    home.service_04,
    home.service_05
  ])
  .compact()
  .map((news) => news._id)
  .value();

  radioAgencia.getRadioNewsList(excludedNewsIds, (err, list) => {
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

function ifPhotoCaptionPublishesList(news, callback) {
  if (!news.isPhotoCaption()) {
    return callback();
  }

  photoCaptions.getList((err, list) => {
    if (err) return callback(err);

    hexo.publishList(list, callback);
  });
}

function publishNewsDataFile(news, callback) {
  if (news.isAdvertising()) {
    return callback();
  }
  hexo.publish(news, callback);
}

function publishAreaDataFile(news) {
  var newsTypesWithArea = ['post', 'column', 'tabloid_news', 'special'];
  if(news.metadata.area !== 'radioagencia' && _.contains(newsTypesWithArea, news.metadata.layout)) {
    var areaName;

    if(news.isColumn()) {
      areaName = news.metadata.layout;
    }
    else {
      areaName = news.metadata.area;
    }
    return async.apply(hexo.updateAreaPage, areaName);
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

function publishColumnistAreaDataFile(news) {
  var areaName;

  if (news.isColumn()) {
    areaName = news.metadata.columnist;
    return async.apply(hexo.updateAreaPage, areaName);
  }

  return doNothing;
}

function publishRegionalNewsDataFile(news) {
  if (news.isTabloidNews()) {

    return async.apply(hexo.updateAreaPage, news.region);
  }

  return doNothing;
}

var publishHomes = function(callback) {
  var publish = (name, callback) => {
    Home.findByName(name, (err, home) => {
      if (err) return callback(err);

      module.exports.publishHome(home, callback);
    });
  };

  async.series([
    async.apply(publish, 'bdf'),
    async.apply(publish, 'radio_agencia')
  ], callback);
};

var publish = function(news, callback) {
  if ((!news.isDraft()) && (!news.isChanged())) {
    return callback({error: 'It is not allowed to publish news with this state.', news});
  }

  news.status = 'published';
  news.published_at = news.published_at || new Date();
  news.generateUrl();

  var pipeline = [
    news.save,
    async.apply(ifTabloidEnrichesWithNews, news),
    async.apply(ifTabloidNewsEnrichesWithTabloid, news),
    async.apply(enrichesWithRelatedNews, news),
    async.apply(enrichesWithRelatedPhotoCaptions, news),
    async.apply(enrichesWithOtherNews, news),
    async.apply(publishNewsDataFile, news),
    async.apply(ifHasTabloidPublish, news),
    async.apply(ifPhotoCaptionPublishesList, news),
    publishAreaDataFile(news),
    publishLastNewsDataFile(news),
    publishRegionalNewsDataFile(news),
    publishColumnistAreaDataFile(news),
    publishHomes
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
    async.apply(ifTabloidEnrichesWithNews, news),
    async.apply(ifHasTabloidPublish, news),
    publishAreaDataFile(news),
    publishLastNewsDataFile(news),
    publishRegionalNewsDataFile(news),
    publishColumnistAreaDataFile(news),
    publishHomes
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

  if(home.isBDF()) {
    pipeline.push(async.apply(hexo.publishAdvertisingData, home));
  }

  async.series(pipeline, callback);
};

module.exports = {
  publish: publish,
  unpublish: unpublish,
  publishHome: publishHome,
  remove: remove
};

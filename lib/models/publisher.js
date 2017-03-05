'use strict';

var async = require('async');
var hexo = require('../publisher/hexo');
var hexoSource = require('../publisher/hexo_source');
var site = require('../publisher/site');
var _ = require('underscore');
var tabloids = require('../models/news/tabloids');
var photoCaptions = require('../models/news/photo-captions');
var News = require('../models/news');
var radioAgencia = require('../models/home/radio-agencia');
var bdf = require('../models/home/bdf');
var Home = require('../models/home');
var columnists = require('../services/columnist');
var columnist = require('../models/columnist');

function publisherWorker(someNews, callback) {
  hexoSource.removePosts((err) => {
    if(err) return callback(err);

    publish(someNews, callback);
  });
}

var publisherCargo = async.cargo(publisherWorker, 100);

function publishLater(news, callback) {
  news.status = 'pending';

  news.save((err, news) => {
    if (err) return callback(err);

    publisherCargo.push(news, (err) => {
      if (err) console.error('PUBLISHER', err);
    });
    callback(null, news);
  });
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
    publish([tabloid], (err) => {
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
    home.featured_01
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

function publishNewsDataFile(news, callback) {
  if (news.isAdvertising()) {
    return callback();
  }
  hexo.publish(news, callback);
}

function publishPhotoCaptionList(callback) {
  photoCaptions.getList((err, list) => {
    if (err) return callback(err);

    hexo.publishList({
      layout: 'photo_caption_list',
      path: News.getPhotoCaptionListPath(),
      news: list
    }, callback);
  });
}

function publishAreaList(area, callback) {
  News.find().publisheds().byArea(area)
    .sort('-published_at').limit(40)
    .exec((err, list) => {
      if (err) return callback(err);

      hexo.publishList({
        layout: 'news_list',
        path: News.getAreaListPath(area),
        area: area,
        news: list
      }, callback);
    });
}

function publishAllAreaLists(callback) {
  var pipeline = [
    async.apply(publishAreaList, 'opiniao'),
    async.apply(publishAreaList, 'politica'),
    async.apply(publishAreaList, 'direitos_humanos'),
    async.apply(publishAreaList, 'cultura'),
    async.apply(publishAreaList, 'geral'),
    async.apply(publishAreaList, 'internacional'),
    async.apply(publishAreaList, 'especiais'),
    async.apply(publishAreaList, 'espanol')
  ];

  async.parallel(pipeline, callback);
}

function publishColumnsList(callback) {
  News.find().publisheds().byLayouts(['column']).sort('-published_at')
    .limit(40).exec((err, list) => {
      if (err) return callback(err);

      hexo.publishList({
        layout: 'columnists',
        path: columnists.getColumnsListPath(),
        news: list
      }, callback);
    });
}

function publishAllRegionalLists(callback) {
  var pipeline = [
    async.apply(publishRegionalList, 'tabloid_rj'),
    async.apply(publishRegionalList, 'tabloid_mg'),
    async.apply(publishRegionalList, 'tabloid_pr'),
    async.apply(publishRegionalList, 'tabloid_pe'),
    async.apply(publishRegionalList, 'tabloid_ce')
  ];

  async.parallel(pipeline, callback);
}

function publishRegionalList(region, callback) {
  News.find().publisheds().byRegion(region).sort('-published_at')
    .limit(40).exec((err, list) => {
      if (err) return callback(err);

      hexo.publishList({
        layout: 'news_list',
        path: News.getRegionalListPath(region),
        area: region,
        news: list
      }, callback);
    });
}

function publishAllServicesList(callback) {
  var pipeline = [
    async.apply(publishServiceList, 'hojenahistoria'),
    async.apply(publishServiceList, 'alimentoesaude'),
    async.apply(publishServiceList, 'nossosdireitos'),
    async.apply(publishServiceList, 'fatoscuriosos'),
    async.apply(publishServiceList, 'mosaicocultural'),
    async.apply(publishServiceList, 'programasemanal')
  ];

  async.parallel(pipeline, callback);
}

function publishServiceList(service, callback) {
  News.find().publisheds().byService(service).sort('-published_at')
    .limit(40).exec((err, list) => {
      if (err) return callback(err);

      hexo.publishList({
        layout: 'news_list',
        path: News.getServiceListPath(service),
        area: service,
        news: list
      }, callback);
    });
}

function publishLastNewsList(callback) {
  News.find()
    .publisheds()
    .byLayouts(['post', 'tabloid_news', 'column', 'special'])
    .sort('-published_at')
    .limit(40)
    .exec((err, list) => {
      if (err) return callback(err);

      hexo.publishList({
        layout: 'news_list',
        path: News.getLastNewsListPath(),
        area: 'ultimas_noticias',
        news: list
      }, callback);
    });
}

function publishAllColumnistsLists(callback) {
  async.each(columnist.all(), publishColumnistList, callback);
}

function publishColumnistList(aColumnist, callback) {
  News.find().publisheds().byColumnist(aColumnist.email)
    .sort('-published_at')
    .limit(40).exec((err, list) => {
      if (err) return callback(err);

      hexo.publishList({
        layout: 'columnist_list',
        path: columnists.getColumnistListPath(aColumnist.email),
        news: list
      }, callback);
    });
}

var publishHomes = function(callback) {
  var publish = (name, callback) => {
    Home.findByName(name, (err, home) => {
      if (err) return callback(err);
      if (!home) return callback(`Not Found ${name}`);

      module.exports.publishHome(home, false, callback);
    });
  };

  async.series([
    async.apply(publish, 'bdf'),
    async.apply(publish, 'radio_agencia')
  ], callback);
};

var publishLists = function(callback) {
  var pipeline = [
    publishPhotoCaptionList,
    publishAllAreaLists,
    publishColumnsList,
    publishLastNewsList,
    publishAllRegionalLists,
    publishAllColumnistsLists,
    publishAllServicesList
  ];

  async.parallel(pipeline, callback);
};

var isPublishable = function(news) {
  return news.isDraft() || news.isChanged() || news.isPending();
};

var publishOne = function(news, callback) {
  if (!isPublishable(news)) {
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
    async.apply(ifHasTabloidPublish, news)
  ];

  async.series(pipeline, function(err) {
    callback(err, news);
  });
};

var publish = function(news, callback) {
  async.mapSeries(news, publishOne, (err, list) => {
    if(err) return callback(err);

    async.parallel([
      publishLists,
      publishHomes
    ], (err) => {
      if(process.env.TOGGLE_qVIq5Tnp_INCREMENTAL_GEN == 'enabled') {
        hexo.generate('publish', callback);
      } else {
        hexo.generate('publish', _.noop);
        callback(err, list);
      }
    });
  });
};

var unpublish = function(news, callback) {
  news.status = 'draft';

  var pipeline = [
    async.apply(news.save),
    async.apply(site.remove, news.metadata.url),
    async.apply(ifTabloidEnrichesWithNews, news),
    async.apply(ifHasTabloidPublish, news),
    publishLists,
    publishHomes
  ];

  async.series(pipeline, function(err) {
    hexo.generate('unpublish', _.noop);
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
  async.parallel([
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

var publishHome = (home, generate, callback) => {
  var pipeline = [
    (cb) => home.populateAllFields(cb),
    async.apply(enrichesHome, home),
    async.apply(hexo.publishHome, home)
  ];

  if(home.isBDF()) {
    pipeline.push(async.apply(hexo.publishAdvertisingData, home));
  }

  async.series(pipeline, (err) => {
    if(generate) hexo.generate('publish', _.noop);
    callback(err);
  });
};

module.exports = {
  publish: publish,
  unpublish: unpublish,
  publishHome: publishHome,
  remove: remove,
  publishLater: publishLater
};

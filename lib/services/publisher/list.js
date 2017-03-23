var apply = require('async').apply;
var parallel = require('async').parallel;
var each = require('async').each;
var hexo = require('lib/services/hexo');
var photoCaptions = require('lib/models/news/photo-captions');
var News = require('lib/models/news');
var columnists = require('lib/services/columnist');
var columnist = require('lib/models/columnist');

function publishAll(callback) {
  var pipeline = [
    publishPhotoCaptionList,
    publishAllAreaLists,
    publishColumnsList,
    publishLastNewsList,
    publishAllRegionalLists,
    publishAllColumnistsLists,
    publishAllServicesList
  ];

  parallel(pipeline, callback);
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
    apply(publishAreaList, 'opiniao'),
    apply(publishAreaList, 'politica'),
    apply(publishAreaList, 'direitos_humanos'),
    apply(publishAreaList, 'cultura'),
    apply(publishAreaList, 'geral'),
    apply(publishAreaList, 'internacional'),
    apply(publishAreaList, 'especiais'),
    apply(publishAreaList, 'espanol')
  ];

  parallel(pipeline, callback);
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
    apply(publishRegionalList, 'tabloid_rj'),
    apply(publishRegionalList, 'tabloid_mg'),
    apply(publishRegionalList, 'tabloid_pr'),
    apply(publishRegionalList, 'tabloid_pe'),
    apply(publishRegionalList, 'tabloid_ce')
  ];

  parallel(pipeline, callback);
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
    apply(publishServiceList, 'hojenahistoria'),
    apply(publishServiceList, 'alimentoesaude'),
    apply(publishServiceList, 'nossosdireitos'),
    apply(publishServiceList, 'fatoscuriosos'),
    apply(publishServiceList, 'mosaicocultural'),
    apply(publishServiceList, 'programasemanal')
  ];

  parallel(pipeline, callback);
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
  each(columnist.all(), publishColumnistList, callback);
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

module.exports = {
  publishAll
};

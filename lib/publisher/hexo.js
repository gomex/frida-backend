'use strict';

var grayMatter = require('gray-matter');
var YAML = require('js-yaml');
var moment = require('moment');
var path = require('path');
var async = require('async');
var _ = require('underscore');

var areaPageStrategy = require('./area-page-strategy');
var homeStrategy = require('./home-strategy');
var presenter = require('./presenter');
var photoCaptionList = require('./photo-caption-list');
var staticFiles = require('./static-files');
var writer = require('./writer');

var HEXO_DATA_PATH = '_data';
var HEXO_NEWS_PATH = '_posts';

function createSiteIndexDataFile(homeNews, callback) {
  var frontMatter   = grayMatter.stringify('', homeNews);
  var indexFilePath = 'index.md';
  writer.write(indexFilePath, frontMatter, callback);
}

function createAreaPaginationDataFiles(areaName, areaPageData, callback) {
  areaName = (areaName === 'column') ? 'colunistas' : areaName;

  // other pages
  _.rest(areaPageData).map(function(d) {
    var filepath = path.join(areaName, 'pagina'+(d.current+1)+'.md');
    var data = grayMatter.stringify('', areaPageData[d.current]);
    writer.write(filepath, data, _.noop);
  });
  // area index page
  var filepath = path.join(areaName, 'index.md');
  var data = grayMatter.stringify('', areaPageData[0]);
  writer.write(filepath, data, callback);
}

function getNewsSourcePath(news) {
  var dir = moment(news.published_at).format('YYYY/MM');
  var name = news._id + '.md';
  return path.join(HEXO_NEWS_PATH, dir, name);
}

function publish(news, callback) {
  var data = presenter.of(news).getData(news);
  var frontMatter = grayMatter.stringify(news.body, data);
  var filepath = getNewsSourcePath(news);

  writer.write(filepath, frontMatter, callback);
}

function unpublish(news, callback) {
  writer.remove(getNewsSourcePath(news), callback);
}

function publishList(list, callback) {
  var data = photoCaptionList.getData(list);

  createAreaPaginationDataFiles(data.area, [data], callback);
}

function publishStaticFiles(callback) {
  async.series([
    async.apply(staticFiles.generate, 'quem-somos', 'static_about'),
    async.apply(staticFiles.generate, 'contato', 'static_contact'),
    async.apply(staticFiles.generate, 'mapa-do-site', 'static_sitemap'),
    async.apply(staticFiles.generate, 'publicidade', 'static_advertising'),
    async.apply(staticFiles.generate, 'parceiros', 'static_partners')
  ], callback);
}

module.exports =
{
  unpublish: unpublish,

  publish: publish,

  publishList: publishList,

  publishStaticFiles: publishStaticFiles,

  updateAreaPage: function(areaName, callback) {
    areaPageStrategy.buildPageData(areaName, function(err, areaPageData) {
      if(err) {
        callback(err);
      } else {
        createAreaPaginationDataFiles(areaName, areaPageData, callback);
      }
    });
  },

  updateHomePage: function (callback) {
    homeStrategy.buildHome(function(err, homeNews) {
      if(err) {
        callback(err);
      } else {
        createSiteIndexDataFile(homeNews, callback);
      }
    });
  },

  updateAdvertisingData: function(news, callback) {
    var filepath = path.join(HEXO_DATA_PATH, 'advertisings.yml');
    var dataYaml = '';

    if(news.isPublished()) {
      var data = {
        [news.metadata.display_area]: presenter.of(news).getData(news)
      };
      dataYaml = YAML.dump(data);
    }

    writer.write(filepath, dataYaml, callback);
  }
};

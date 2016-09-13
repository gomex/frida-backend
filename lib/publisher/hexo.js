'use strict';

var fs              = require('fs');
var grayMatter      = require('gray-matter');
var YAML            = require('js-yaml');
var mkdirp          = require('mkdirp');
var moment          = require('moment');
var path            = require('path');
var async = require('async');
var _ = require('underscore');

var areaPageStrategy    =  require('./area-page-strategy');
var homeStrategy        =  require('./home-strategy');
var newsPublisher = require('./news');
var tabloidPublisher = require('./news/tabloid');
var postPresenter = require('./presenters/post');
var listPublisher = require('./news/list');

var HEXO_SOURCE_PATH    = process.env.HEXO_SOURCE_PATH;
var HEXO_POSTS_PATH     = path.join(HEXO_SOURCE_PATH, '_posts');
var HEXO_DATA_PATH     = path.join(HEXO_SOURCE_PATH, '_data');

function createSiteIndexDataFile(homeNews, callback) {
  mkdirp(HEXO_SOURCE_PATH, function(err){
    if(err) {
      callback(err);
    } else {
      var frontMatter   = grayMatter.stringify('', homeNews);
      var indexFilePath = path.join(HEXO_SOURCE_PATH, 'index.md');

      fs.writeFile(indexFilePath, frontMatter, callback);
    }
  });
}

function writeDataToFile(areaIndexDir, areaIndexFilename, data, callback) {
  var areaIndexFilePath = path.join(areaIndexDir, areaIndexFilename);
  var areaIndexFrontMatter = grayMatter.stringify('', data);
  fs.writeFile(areaIndexFilePath, areaIndexFrontMatter, callback);
}

function createAreaPaginationDataFiles(areaName, areaPageData, callback) {
  areaName = (areaName === 'column') ? 'colunistas' : areaName;

  var areaIndexDir = path.join(HEXO_SOURCE_PATH, areaName);
  mkdirp(areaIndexDir, function(err) {
    if(err) {
      callback(err);
    } else {
      // other pages
      _.rest(areaPageData).map(function(d) {
        writeDataToFile(areaIndexDir, 'pagina'+(d.current+1)+'.md', areaPageData[d.current], _.noop);
      });
      // area index page
      writeDataToFile(areaIndexDir, 'index.md', areaPageData[0], callback);
    }
  });
}

function getSourceDir(news) {
  var dir = moment(news.published_at).format('YYYY/MM');
  return path.join(HEXO_POSTS_PATH, dir);
}

function getSourcePath(news) {
  var filedir = getSourceDir(news);
  return path.join(filedir, news._id + '.md');
}

function publisherOf(news) {
  switch (news.metadata.layout) {
  case 'tabloid':
    return tabloidPublisher;
  case 'post':
    return postPresenter;
  default:
    return newsPublisher;
  }
}

function publish(news, callback) {
  var filedir = getSourceDir(news);
  async.series([
    async.apply(mkdirp, filedir),
    function(callback) {
      var data = publisherOf(news).getData(news);
      var frontMatter = grayMatter.stringify(news.body, data);

      var filepath = path.join(filedir, news._id + '.md');
      fs.writeFile(filepath, frontMatter, callback);
    }
  ], callback);
}

function unpublish(news, callback) {
  fs.unlink(getSourcePath(news), function(err) {
    if(err && err.code == 'ENOENT') {
      callback();
    } else {
      callback(err);
    }
  });
}

function publishList(list, callback) {
  var data = listPublisher.getData(list);

  createAreaPaginationDataFiles(data.area, [data], callback);
}

module.exports =
{
  unpublish: unpublish,

  publish: publish,

  publishList: publishList,

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
    var advertisingDataFilePath = path.join(HEXO_DATA_PATH, 'advertisings.yml');
    var advertisingData = {};
    var advertisingDataYaml = '';

    if(news.isPublished()) {
      advertisingData[news.metadata.display_area] = {
        link: news.link,
        image: news.image,
        title: news.metadata.title
      };
      advertisingDataYaml = YAML.dump(advertisingData);
    }

    fs.writeFile(advertisingDataFilePath, advertisingDataYaml, callback);
  }
};

'use strict';

var fs              = require('fs');
var grayMatter      = require('gray-matter');
var mkdirp          = require('mkdirp');
var moment          = require('moment');
var path            = require('path');
var async = require('async');
var _ = require('underscore');

var areaPageStrategy    =  require('./area-page-strategy');
var homeStrategy        =  require('./home-strategy');
var newsPublisher = require('./news');
var tabloidPublisher = require('./news/tabloid');
var postPublisher = require('./news/post');


var HEXO_SOURCE_PATH    = process.env.HEXO_SOURCE_PATH;
var HEXO_POSTS_PATH     = path.join(HEXO_SOURCE_PATH, '_posts');

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
        writeDataToFile(areaIndexDir, 'page'+d.current+'.md', areaPageData[d.current], _.noop);
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
    return postPublisher;
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

module.exports =
{
  unpublish: unpublish,

  publish: publish,

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
  }
};

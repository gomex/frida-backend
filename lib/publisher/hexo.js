'use strict';

var fs              = require('fs');
var grayMatter      = require('gray-matter');
var mkdirp          = require('mkdirp');
var moment          = require('moment');
var path            = require('path');
var async = require('async');

var areaPageStrategy    =  require('./area-page-strategy');
var homeStrategy        =  require('./home-strategy');
var newsPublisher = require('./news');

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

function createAreaIndexDataFile(areaName, areaPageData, callback) {
  areaName = (areaName === 'column') ? 'colunistas' : areaName;

  var areaIndexDir = path.join(HEXO_SOURCE_PATH, areaName);
  mkdirp(areaIndexDir, function(err) {
    if(err) {
      callback(err);
    } else {
      var areaIndexFilePath = path.join(areaIndexDir, 'index.md');
      var areaIndexFrontMatter = grayMatter.stringify('', areaPageData);

      fs.writeFile(areaIndexFilePath, areaIndexFrontMatter, callback);
    }
  });
}

function getFileDir(news) {
  var dir = moment(news.published_at).format('YYYY/MM');
  return path.join(HEXO_POSTS_PATH, dir);
}

function createNewsDataFile(news, callback) {
  var data = newsPublisher.getData(news);
  if (news.issuu)
    data.issuu = news.issuu;

  var filedir = getFileDir(news);
  async.series([
    async.apply(mkdirp, filedir),
    function(callback) {
      var filepath = path.join(filedir, news._id + '.md');
      var frontMatter = grayMatter.stringify(news.body, data);
      fs.writeFile(filepath, frontMatter, callback);
    }
  ], callback);
}

function unpublish(news, callback) {
  var filedir = getFileDir(news);
  var filepath = path.join(filedir, news._id + '.md');

  fs.unlink(filepath, function(err) {
    if(err && err.code == 'ENOENT') {
      callback();
    } else {
      callback(err);
    }
  });
}

module.exports =
{
  publish: function(news, callback) {
    createNewsDataFile(news, callback);
  },

  unpublish: unpublish,

  updateAreaPage: function(areaName, callback) {
    areaPageStrategy.buildPageData(areaName, function(err, areaPageData) {
      if(err) {
        callback(err);
      } else {
        createAreaIndexDataFile(areaName, areaPageData, callback);
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

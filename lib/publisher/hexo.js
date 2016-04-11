'use strict';

var _               = require('underscore');
var fs              = require('fs');
var grayMatter      = require('gray-matter');
var mkdirp          = require('mkdirp');
var moment          = require('moment');
var path            = require('path');

var areaPageStrategy    =  require('./area-page-strategy');
var homeStrategy        =  require('./home-strategy');

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

function createNewsDataFile(news, callback) {
  var publishedAt = moment(news.published_at);
  var postDir = publishedAt.format('YYYY/MM');
  var fsPostDir = path.join(HEXO_POSTS_PATH, postDir);
  var fsPostPath = path.join(fsPostDir, news._id + '.md');

  var newsMetadataClone = _.clone(news.metadata);
  newsMetadataClone.date = news.published_at;
  if (news.issuu)
    newsMetadataClone.issuu = news.issuu;

  var frontMatter = grayMatter.stringify(news.body, newsMetadataClone);

  mkdirp(fsPostDir, function(err) {
    if(err) {
      callback(err);
    } else {
      fs.writeFile(fsPostPath, frontMatter, function(err) {
        callback(err);
      });
    }
  });
}

module.exports =
{
  publish: function(news, callback) {
    createNewsDataFile(news, callback);
  },

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

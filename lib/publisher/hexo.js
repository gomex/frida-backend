'use strict';

var _               = require('underscore');
var fs              = require('fs');
var grayMatter      = require('gray-matter');
var mkdirp          = require('mkdirp');
var moment          = require('moment');
var path            = require('path');
var slug            = require('slug');

var areaHomeStrategy    =  require('./area-home-strategy');
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

function createAreaIndexDataFile(area, callback) {
  areaHomeStrategy.buildHomeFor(area, function(err, homeForArea) {
    if(err) {
      callback(err, null);
    } else {
      var areaIndexDir = path.join(HEXO_SOURCE_PATH, area);
      mkdirp(areaIndexDir, function(err) {
        if(err) {
          callback(err);
        } else {
          var areaIndexFilePath = path.join(areaIndexDir, 'index.md');
          var areaIndexFrontMatter = grayMatter.stringify('', homeForArea);

          fs.writeFile(areaIndexFilePath, areaIndexFrontMatter, callback);
        }
      });
    }
  });
}

module.exports =
{
  publish: function(news, callback) {
    var publishedAt = moment(news.published_at);
    var postDir = publishedAt.format('YYYY/MM');
    var slugTitle = slug(news.metadata.title);
    var httpPostPath = path.join(postDir, slugTitle, '/');

    var fsPostDir = path.join(HEXO_POSTS_PATH, postDir);
    var fsPostPath = path.join(fsPostDir, news._id + '.md');

    var newsMetadataClone = _.clone(news.metadata);
    newsMetadataClone.date = news.published_at;

    var frontMatter = grayMatter.stringify(news.body, newsMetadataClone);

    mkdirp(fsPostDir, function(err) {
      if(err) {
        callback(err);
      } else {
        fs.writeFile(fsPostPath, frontMatter, function(err) {
          if(err) {
            callback(err);
          } else {
            createAreaIndexDataFile(news.metadata.area, function(err){
              callback(err, httpPostPath);
            });
          }
        });
      }
    });
  },

  updateHome: function (callback) {
    homeStrategy.buildHome(function(err, homeNews) {
      if(err) {
        callback(err);
      } else {
        createSiteIndexFileDataFile(homeNews, callback);
      }
    });
  }
};

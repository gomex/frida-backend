'use strict';

var _               =  require('underscore');
var fs              =  require('fs');
var grayMatter         =  require('gray-matter');
var mkdirp          =  require('mkdirp');
var moment          =  require('moment');
var slug            =  require('slug');

var areaHomeStrategy    =  require('./area-home-strategy');
var homeStrategy        =  require('./home-strategy');

var HEXO_SOURCE_PATH    = process.env.HEXO_SOURCE_PATH;
var HEXO_POSTS_PATH     = [HEXO_SOURCE_PATH, '_posts'].join('/');

function createSiteIndexFile(homeNews, callback) {
  var homeDir = process.env.HEXO_SOURCE_PATH;

  mkdirp(homeDir, function(err){
    if(err) {
      callback(err);
    } else {
      var frontMatter   = grayMatter.stringify('', homeNews);
      var indexFilePath = [homeDir, 'index.md'].join('/');

      fs.writeFile(indexFilePath, frontMatter, callback);
    }
  });
}

function publishAreaIndex(area, callback) {
  areaHomeStrategy.buildHomeFor(area, function(err, homeForArea) {
    if(err) {
      callback(err, null);
    } else {
      var areaIndexDir = [HEXO_SOURCE_PATH, area].join('/');
      mkdirp(areaIndexDir, function(err) {
        if(err) {
          callback(err);
        } else {
          var areaIndexFilePath = [areaIndexDir, 'index.md'].join('/');
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
    var httpPostPath = [postDir, slugTitle].join('/') + '/';

    var fsPostDir = [HEXO_POSTS_PATH, postDir].join('/');
    var fsPostPath = [fsPostDir, news._id + '.md'].join('/');

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
            publishAreaIndex(news.metadata.area, function(err){
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
        createSiteIndexFile(homeNews, callback);
      }
    });
  }
};

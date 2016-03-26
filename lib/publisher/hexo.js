'use strict';

var _               =  require('underscore');
var fs              =  require('fs');
var grayMatter         =  require('gray-matter');
var mkdirp          =  require('mkdirp');
var moment          =  require('moment');
var slug            =  require('slug');

var homeStrategy    =  require('./home-strategy');

var HEXO_SOURCE_PATH    = process.env.HEXO_SOURCE_PATH;
var HEXO_POSTS_PATH     = [HEXO_SOURCE_PATH, '_posts'].join('/');

function mkdir(path, callback) {
  mkdirp(path, function(err) {
    if(err) {
      console.log('Could not create dir ', path, '. Error:', err);
    } else {
      callback();
    }
  });
}

function writeFile(path, content, callback) {
  fs.writeFile(path, content, function(err) {
    if(err) {
      console.log('Could not write file ', path, '. Error:', err);
    } else {
      callback();
    }
  });
}

function createSiteIndexFile(homeNews, callback) {
  var homeDir = process.env.HEXO_SOURCE_PATH;

  mkdir(homeDir, function(){
    var frontMatter   = grayMatter.stringify('', homeNews);
    var indexFilePath = [homeDir, 'index.md'].join('/');

    fs.writeFile(indexFilePath, frontMatter, callback);
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

    mkdir(fsPostDir, function() {
      writeFile(fsPostPath, frontMatter, function() {
        callback(null, httpPostPath);
      });
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

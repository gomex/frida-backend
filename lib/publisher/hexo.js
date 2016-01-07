'use strict';

var matters         =  require('gray-matter');
var mkdirp          =  require('mkdirp');
var homeStrategy    =  require('../publisher/home-strategy');
var fs              =  require('fs');
var slug            =  require('slug');
var moment          =  require('moment');



module.exports = function() {

  // TODO remove from here and insert in a constants or something similar kind of file
  var paths = {
      posts: [process.env.HEXO_SOURCE_PATH, '_posts'].join('/')
  };

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

  return {
    publish: function(news, callback) {
      var publishedAt = moment(news.metadata.published_at);
      var postDir = [publishedAt.format('YYYY'), publishedAt.format('MM')].join('/');
      var slugTitle = slug(news.metadata.title);
      var httpPostPath = [postDir, slugTitle].join('/') + '/';

      var fsBaseDir = paths.posts;
      var fsPostDir = [fsBaseDir, postDir].join('/');
      var fsPostPath = [fsPostDir, news._id + '.md'].join('/');

      var frontMatter = matters.stringify(news.body, news.metadata);

      mkdir(fsPostDir, function(err) {
        writeFile(fsPostPath, frontMatter, function() {
          callback(httpPostPath);
        });
      });
    },

    updateHome: function (callback) {
      homeStrategy.lastNews(function(homePosts) {
        homePosts.layout = 'nacional';
        var frontMatter = matters.stringify('', homePosts);
        var homeDir = process.env.HEXO_SOURCE_PATH;

        mkdir(homeDir, function(){
          fs.writeFile([homeDir, 'index.md'].join('/'), frontMatter, callback);
        });
      });
    }
  };
};

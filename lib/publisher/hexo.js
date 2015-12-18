'use strict';

var matters         =  require('gray-matter'),
    mkdirp          =  require('mkdirp'),
    homeStrategy    =  require('../publisher/home-strategy'),
    fs              =  require('fs'),
    slug            =  require('slug');



module.exports = function() {

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
      var postDir = [news.metadata.published_at.getFullYear(), news.metadata.published_at.getMonth() + 1].join('/');
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

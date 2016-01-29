'use strict';

var matters         =  require('gray-matter');
var mkdirp          =  require('mkdirp');
var homeStrategy    =  require('./home-strategy');
var fs              =  require('fs');
var slug            =  require('slug');
var moment          =  require('moment');

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

module.exports =
{
  publish: function(news, callback) {
    var publishedAt = moment(news.published_at);
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
    homeStrategy.lastNews(function(homeNews) {
      homeNews.layout = 'nacional';
      var frontMatter = matters.stringify('', homeNews);
      var homeDir = process.env.HEXO_SOURCE_PATH;

      mkdir(homeDir, function(){
        fs.writeFile([homeDir, 'index.md'].join('/'), frontMatter, callback);
      });
    });
  }
};

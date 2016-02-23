'use strict';

var _               =  require('underscore');
var fs              =  require('fs');
var matters         =  require('gray-matter');
var mkdirp          =  require('mkdirp');
var moment          =  require('moment');
var slug            =  require('slug');

var homeStrategy    =  require('./home-strategy');
var newsConstants   =  require('../news/news-constants');

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

function createSiteIndexFile(edition, homeNews, callback) {
  var homeDir = process.env.HEXO_SOURCE_PATH;
  var directoryStructure = [homeDir];
  var editionDirectory = newsConstants.editionsPostsFolder[edition];

  if(editionDirectory){
    directoryStructure.push(editionDirectory);
  }

  var editionIndexPath = directoryStructure.join('/');

  mkdir(editionIndexPath, function(){
    var frontMatter = matters.stringify('', homeNews);

    directoryStructure.push('index.md');
    fs.writeFile(directoryStructure.join('/'), frontMatter, callback);
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

    // adding edition to the path of news inside tabloid or _posts directory
    var editionDirectory = newsConstants.editionsPostsFolder[news.metadata.edition];

    var newsMetadataClone = _.clone(news.metadata);
    if(editionDirectory){
      newsMetadataClone.url = editionDirectory + '/' + news.metadata.url;
    }
    newsMetadataClone.published_at = news.published_at;

    var frontMatter = matters.stringify(news.body, newsMetadataClone);

    mkdir(fsPostDir, function(err) {
      writeFile(fsPostPath, frontMatter, function() {
        callback(httpPostPath);
      });
    });
  },

  updateHome: function (edition, callback) {
    homeStrategy.lastNews(edition, function(homeNews) {
      homeNews.layout = newsConstants.editionsLayout[edition];
      createSiteIndexFile(edition, homeNews, callback);
    });
  }
};

'use strict';

var matters         =  require('gray-matter'),
    mkdirp          =  require('mkdirp'),
    homeStrategy    =  require('../publisher/home-strategy')(),
    fs              =  require('fs'),
    slug            =  require('slug');



module.exports = function() {

  var paths = {
      posts: process.env.HEXO_POSTS_PATH
  };

  var updateHome = function(callback) {

      homeStrategy.lastNews(function(homePosts) {

          var markdown = matters.stringify('', homePosts);
          var homeDir = process.env.HEXO_POSTS_PATH + '/../';

          mkdirp(homeDir, function(err){
              if (err) {
                  console.error(err);
              }else {
                  fs.writeFile([homeDir, 'index.md'].join('/'), markdown, callback);
              }
          });
      });
  };

  return {
    publish: function(news, callback) {
        var postDir = [news.metadata.published_at.getFullYear(), news.metadata.published_at.getMonth() + 1].join('/');
        var slugTitle = slug(news.metadata.title);
        var httpPostPath = [postDir, slugTitle].join('/') + '/';

        var fsBaseDir = paths.posts;
        var fsPostDir = [fsBaseDir, postDir].join('/');
        var fsPostPath = [fsPostDir, news._id + '.md'].join('/');

        var markdown = matters.stringify(news.body, news.metadata);

        mkdirp(fsPostDir, function(err) {
            if (err) {
                console.error(err);
            } else {
                fs.writeFile(fsPostPath, markdown, function(err) {
                    if(err) {
                        console.error(err);
                    } else {
                        updateHome(function() {
                            callback(httpPostPath);
                        });
                    }
                });
            }
        });
    }
  };
};

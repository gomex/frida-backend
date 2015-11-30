'use strict';

var matters =  require('gray-matter'),
    mkdirp  =  require('mkdirp'),
    YAML    =  require('js-yaml'),
    fs      =  require('fs');



module.exports = function() {
  var markdown = '';
  var file = {
    year     : '',
    month    : '',
    name     : ''
  };


  var actionsPost = function(markdown){
    this.read = function(){
      return markdown;
    },
    this.write = function(baseDir, callback){
      var publishDir        = [baseDir, file.year, file.month].join('/');
      var resourcePath      = [file.year, file.month].join('/');
      var filename          = file.name+'.md';

      mkdirp(publishDir, function(err){
        var done = function(err) {callback(err, [resourcePath, filename].join('/'))};
        if (err) {
          console.error(err);
        }else {
          fs.writeFile([publishDir, filename].join('/'), markdown, done);
        }
      });
    }
  };

  var actionsHome = function(markdown){
    this.read = function(){
      return markdown;
    },
    this.write = function(publishDir, callback){
      var filename  = 'index.md';

      mkdirp(publishDir, function(err){
        var done = function(err) {callback(err)};
        if (err) {
          console.error(err);
        }else {
          fs.writeFile([publishDir, filename].join('/'), markdown, done);
        }
      });
    }
  };



  return {
    post:  function(post, id, year, month){
      post = post || {};
      var body = post.body || '';
      var metadata = post.metadata || '';

      var markdown = '';
      if(metadata !== ''){
        markdown =  matters.stringify(body, metadata);
      }

      file.year = year;
      file.month = month;
      file.name = id;

      return new actionsPost(markdown);
    },

    home: function(layout, home) {
        home.layout = layout;
        var markdown = matters.stringify('', home);

        return new actionsHome(markdown);
    }
  };
};

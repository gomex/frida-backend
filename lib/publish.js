'use strict';

var matters =  require('gray-matter'),
    mkdirp  =  require('mkdirp'),
    fs      =  require('fs');



module.exports = function() {
  var markdown = '';
  var file = {
    year     : '',
    month    : '',
    name     : ''
  };


  var actions = {
    read: function(){
      return markdown;
    },
    write: function(path, callback){
      var filename = file.name+'.md';
      var fullpath = [path, file.year, file.month].join('/');
      var done = function(err){ callback(err) };

      mkdirp(fullpath, function(err){
        fullpath = [fullpath, filename].join('/');
        if (err) {
          console.error(err);
        }else {
          fs.writeFile(fullpath, markdown, done);
        }
      });

      return done;
    }
  };



  return {
    toYAML:  function(post, title, year, month){
      post = post || {};
      var body = post.body || '';
      var metadata = post.metadata || '';

      if(metadata !== ''){
        markdown =  matters.stringify(body, metadata);
      }

      file.year = year;
      file.month = month;
      file.name = title;

      return actions;
    }
  };
};

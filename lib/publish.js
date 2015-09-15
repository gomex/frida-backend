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
    write: function(baseDir, callback){
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



  return {
    toYAML:  function(post, id, year, month){
      post = post || {};
      var body = post.body || '';
      var metadata = post.metadata || '';

      if(metadata !== ''){
        markdown =  matters.stringify(body, metadata);
      }

      file.year = year;
      file.month = month;
      file.name = id;

      return actions;
    }
  };
};

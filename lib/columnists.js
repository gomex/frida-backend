'use strict';
var publish  = require('./publish')(),
    YAML     = require('js-yaml'),
    mkdirp  =  require('mkdirp'),
    fs      =  require('fs'),
    _        = require('underscore');

module.exports = function() {
  var actions = function(columnists){
    return {
      read: function(){
        return columnists;
      },
      write: function(path, callback){
        var text =  YAML.dump(columnists);
        var filename          = 'columnists.yml';

        mkdirp(path, function(err){
          var done = function(err) {callback(err, filename)};
          if (err) {
            console.error(err);
          }else {
            fs.writeFile([path, filename].join('/'), text, done);
          }
        });
      }
    };
  };


  return function(data){
    return {
      toDATA: function(){
        var emails  = _.pluck(data, 'email');
        var details = _.map(data, function(object){
          return _.omit(object, 'email');
        });

        var result = _.object(emails, details);

        return actions(result);
      }
    }
  };
};

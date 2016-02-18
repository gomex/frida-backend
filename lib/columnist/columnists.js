'use strict';

var _       = require('underscore');
var fs      = require('fs');
var mkdirp  = require('mkdirp');
var YAML    = require('js-yaml');

function indexByEmail(columnists) {
  var emails  = _.pluck(columnists, 'email');
  var details = _.map(columnists, function(columnist){
    return _.omit(columnist, 'email');
  });

  return _.object(emails, details);
};

var columnists = {

  read: function(columnists){
    return indexByEmail(columnists);
  },
  write: function(path, columnists, callback){
    if(!path) {
      return callback('Need a path to save data files');
    }

    var text =  YAML.dump(indexByEmail(columnists));
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

module.exports = columnists;

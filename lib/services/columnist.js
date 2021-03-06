'use strict';

var _ = require('underscore');
var YAML = require('js-yaml');
var hexoSource = require('lib/services/hexo/source');
var columnist = require('lib/models/columnist');

var byEmail;

var columnistsByEmail = function() {
  if(byEmail) return byEmail;

  var columnists = columnist.all();
  var emails = _.pluck(columnists, 'email');
  var details = _.map(columnists, (columnist) => {
    return _.omit(columnist, 'email');
  });

  byEmail = _.object(emails, details);
  return byEmail;
};

var write = function(callback) {
  var columnists = columnistsByEmail();
  var text = YAML.dump(columnists);
  var filename = '_data/columnists.yml';

  hexoSource.write(filename, text, callback);
};

var getColumnsListPath = function() {
  return 'colunistas';
};

var getColumnistListPath = function(email) {
  var columnist = columnistsByEmail()[email];
  return `colunistas/${columnist.path}`;
};

module.exports = {
  columnistsByEmail,
  getColumnsListPath,
  getColumnistListPath,
  write
};

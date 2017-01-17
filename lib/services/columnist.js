'use strict';

var _ = require('underscore');
var YAML = require('js-yaml');
var writer = require('../publisher/writer');
var columnist = require('../models/columnist');

var columnistsByEmail = function() {
  var columnists = columnist.all();
  var emails  = _.pluck(columnists, 'email');
  var details = _.map(columnists, (columnist) => {
    return _.omit(columnist, 'email');
  });

  return _.object(emails, details);
};

var write = function(callback) {
  var columnists = columnistsByEmail();
  var text = YAML.dump(columnists);
  var filename = '_data/columnists.yml';

  writer.write(filename, text, callback);
};

module.exports = {
  columnistsByEmail,
  write
};

var path = require('path');
var grayMatter = require('gray-matter');
var writer = require('./writer');

function generate(name, layout, callback) {
  var dirPath = path.join(name, 'index.md');
  var data = grayMatter.stringify('', {layout: layout});

  writer.write(dirPath, data, callback);
}

module.exports = {
  generate: generate
};

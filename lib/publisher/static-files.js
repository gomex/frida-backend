var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');
var grayMatter = require('gray-matter');
var HEXO_SOURCE_PATH = process.env.HEXO_SOURCE_PATH;

function generate(name, layout, callback) {
  var dirPath = path.join(HEXO_SOURCE_PATH, name);
  mkdirp(dirPath, function(err) {
    if (err) {
      return callback(err);
    }

    var filePath = path.join(dirPath, 'index.md');
    var data = grayMatter.stringify('', {layout: layout});
    fs.writeFile(filePath, data, callback);
  });
}

module.exports = {
  generate: generate
};

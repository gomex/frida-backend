var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');

var HEXO_SOURCE_PATH = process.env.HEXO_SOURCE_PATH;

function write(filepath, content, callback) {
  var absolutePath = path.join(HEXO_SOURCE_PATH, filepath);
  var dirpath = path.dirname(absolutePath);

  mkdirp(dirpath, (err) => {
    if(err) return callback(err);

    fs.writeFile(absolutePath, content, callback);
  });
}

function remove(filepath, callback) {
  var absolutePath = path.join(HEXO_SOURCE_PATH, filepath);

  fs.unlink(absolutePath, (err) => {
    if(err && err.code == 'ENOENT') {
      callback();
    } else {
      callback(err);
    }
  });
}

module.exports = {
  write,
  remove
};
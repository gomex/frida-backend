var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

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

function deleteDir(keepRoot, dirPath) {
  _.each(fs.readdirSync(dirPath), (file) => {
    var childPath = path.join(dirPath, file);
    var stats = fs.statSync(childPath);
    if(stats.isDirectory()) {
      deleteDir(false, childPath);
    } else {
      fs.unlinkSync(childPath);
    }
  });

  if(!keepRoot) fs.rmdirSync(dirPath);
}

function removeAll() {
  deleteDir(true, process.env.HEXO_SOURCE_PATH);
}

module.exports = {
  write,
  remove,
  removeAll
};

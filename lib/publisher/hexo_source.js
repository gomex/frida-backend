var mkdirp = require('mkdirp');
var fs = require('fs');
var path = require('path');
var rmdir = require('rmdir');

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
    } else if(err) {
      callback(err);
    } else {
      callback();
    }
  });
}

function removePosts(callback) {
  var postsDir = path.join(process.env.HEXO_SOURCE_PATH, '_posts');
  function _createPostsDir() {
    fs.mkdir(postsDir, callback);
  }
  rmdir(postsDir, (err) => {
    if(err && err.code == 'ENOENT') {
      _createPostsDir();
    } else if(err) {
      callback(err);
    } else {
      _createPostsDir();
    }
  });
}

module.exports = {
  write,
  remove,
  removePosts
};

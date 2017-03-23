var rmdir = require('rmdir');
var path = require('path');

function remove(urlPath, callback) {
  rmdir(path.join(process.env.HEXO_SITE_DEST, urlPath), (err) => {
    if(err && err.code == 'ENOENT') {
      callback();
    } else if(err) {
      callback(err);
    } else {
      callback();
    }
  });
}

module.exports = {
  remove
};

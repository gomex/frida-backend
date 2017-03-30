var News = require('lib/models/news');
var hexo = require('lib/services/hexo');

function publish(callback) {
  News.find().byMonth(2017, 2).exec((err, list) => {
    if (err) return callback(err);
  
    hexo.publishArchive(list, callback);
  });
} 

module.exports = {
  publish
};
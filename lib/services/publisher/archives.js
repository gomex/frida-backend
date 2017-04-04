var News = require('lib/models/news');
var hexo = require('lib/services/hexo');
var moment = require('moment');

function publish(callback) {
  var month = moment().month();
  var year = moment().year();
  
  News.find().byMonth(year, month).exec((err, list) => {
    if (err) return callback(err);
  
    hexo.publishArchive(
      {
        list : list,
        year : year,
        month: month
      }, callback);

  });
} 

module.exports = {
  publish
};
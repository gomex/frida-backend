var News = require('../news');
var _ = require('underscore');

var LIMIT = 10;

function getList(callback) {
  var query = {
    'metadata.layout': 'photo_caption',
    status: 'published'
  };

  var options = {limit: LIMIT, sort: '-created_at'};

  News.find(query, null, options, callback);
}

function getRelateds(news, callback) {
  var query = {
    'metadata.layout': 'photo_caption',
    status: 'published'
  };

  var options = {limit: 3, sort: '-created_at'};

  News.find(query, null, options, function(err, listNews) {
    var filteredList = _.filter(listNews, function(photoCaption){
      return photoCaption.id != news.id;
    });
    callback(err, filteredList);
  });
}

module.exports = {
  getList: getList,
  getRelateds: getRelateds
};

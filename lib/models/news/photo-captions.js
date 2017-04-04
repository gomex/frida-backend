var News = require('lib/models/news');
var LIMIT = 10;

function getList(callback) {
  var query = {
    'metadata.layout': 'photo_caption',
    status: 'published'
  };

  var options = {limit: LIMIT, sort: '-published_at'};

  News.find(query, null, options, callback);
}

function getRelateds(news, callback) {
  var query = {
    'metadata.layout': 'photo_caption',
    status: 'published',
    _id: {
      $ne: news._id
    }
  };

  var options = {limit: 3, sort: '-published_at'};

  News.find(query, null, options, callback);
}

module.exports = {
  getList: getList,
  getRelateds: getRelateds
};

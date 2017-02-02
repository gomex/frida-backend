var News = require('../news');

function getLastNews(callback) {
  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'},
      {'metadata.layout': 'column'},
      {'metadata.layout': 'special'}
    ]
  };

  var options = {limit: 8, sort: '-published_at'};

  News.find(query, null, options, callback);
}

function getMostRead(callback) {
  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'}
    ],
    'metadata.most_read': true
  };

  var options = {limit: 5, sort: '-published_at'};

  News.find(query, null, options, callback);
}

module.exports = {
  getLastNews,
  getMostRead
};

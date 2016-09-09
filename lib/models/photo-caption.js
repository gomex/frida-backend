var News = require('./news');

var LIMIT = 10;

function find(callback) {
  var query = {
    'metadata.layout': 'photo_caption',
    status: 'published'
  };

  var options = {limit: LIMIT, sort: '-created_at'};

  News.find(query, null, options, callback);
}

module.exports = {
  find: find
};

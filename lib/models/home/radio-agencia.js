var News = require('../news');

function getRadioNewsList(callback) {
  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'},
      {'metadata.layout': 'column'}
    ],
    'tags': {$in: ['radioagencia', 'radioagência']}
  };

  var options = {limit: 20, sort: '-created_at'};

  News.find(query, null, options, callback);
}

module.exports = {
  getRadioNewsList
};

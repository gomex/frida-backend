var News = require('../news');

function getRadioNewsList(excludedNews, callback) {
  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'},
      {'metadata.layout': 'column'}
    ],
    'labels': {$in: ['radioagencia', 'radioagência']},
    '_id': {
      $ne: excludedNews._id
    }
  };

  var options = {limit: 20, sort: '-created_at'};

  News.find(query, null, options, callback);
}

module.exports = {
  getRadioNewsList
};

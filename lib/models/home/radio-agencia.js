var News = require('../news');

function getRadioNewsList(excludedNewsIds, callback) {
  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'}
    ],
    $and: [
      {'tags': {$in: ['radioagencia', 'radioagência']}},
      {'tags': {$nin: ['alimentoesaude', 'fatoscuriosos', 'hojenahistoria', 'mosaicocultural', 'nossosdireitos']}}
    ],
    '_id': { $nin: excludedNewsIds }
  };

  var options = {limit: 20, sort: '-created_at'};

  News.find(query, null, options, callback);
}

module.exports = {
  getRadioNewsList
};

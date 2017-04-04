var News = require('lib/models/news');

function getRadioNewsList(excludedNewsIds, callback) {
  var services = [
    'alimentoesaude',
    'mosaicocultural',
    'programasp',
    'programape',
    'conectados',
    'momentoagroecologico',
    'falaai'
  ];

  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'}
    ],
    $and: [
      {'tags': {$in: ['radioagencia', 'radioagência']}},
      {'tags': {$nin: services}}
    ],
    '_id': { $nin: excludedNewsIds }
  };

  var options = {limit: 20, sort: '-published_at'};

  News.find(query, null, options, callback);
}

module.exports = {
  getRadioNewsList
};

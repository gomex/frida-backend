var News = require('lib/models/news');
var _ = require('underscore');

var LIMIT = 50;

function findNews(tabloid, callback) {
  var query = {
    'metadata.layout': 'tabloid_news',
    status: 'published',
    region: tabloid.metadata.display_area,
    edition: tabloid.edition
  };

  var options = {limit: LIMIT, sort: '-created_at'};

  News.find(query, null, options, callback);
}

function findTabloid(news, callback) {
  var query = {
    'metadata.layout': 'tabloid',
    status: 'published',
    'metadata.display_area': news.region,
    edition: news.edition
  };

  var options = {limit: 1};

  News.find(query, null, options, (err, tabloids) => {
    callback(err, _.first(tabloids));
  });
}

module.exports = {
  findNews: findNews,
  findTabloid: findTabloid
};

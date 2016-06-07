var repository = require('./news-repository');
var _ = require('underscore');

function findNews(tabloid, callback) {
  repository.getAll({
    'metadata.layout': 'tabloid_news',
    status: 'published',
    region: tabloid.metadata.display_area,
    edition: tabloid.edition
  }, callback);
}

function findTabloid(news, callback) {
  repository.find({
    'metadata.layout': 'tabloid',
    status: 'published',
    'metadata.display_area': news.region,
    edition: news.edition
  }, null, 1, null, (err, tabloids) => {
    callback(err, _.first(tabloids));
  });
}

module.exports = {
  findNews: findNews,
  findTabloid: findTabloid
};

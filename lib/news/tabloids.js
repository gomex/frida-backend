var repository = require('./news-repository');

function findNews(tabloid, callback) {
  repository.getAll({
    'metadata.layout': 'tabloid_news',
    status: 'published',
    region: tabloid.metadata.display_area,
    edition: tabloid.edition
  }, callback);
}

module.exports = {
  findNews: findNews
};

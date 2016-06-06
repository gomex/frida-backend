var repository = require('./news-repository');

function findNews(tabloid, callback) {
  repository.getAll({
    'layout': 'tabloid_news',
    'edition': tabloid.edition
  }, callback);
}

module.exports = {
  findNews: findNews
};

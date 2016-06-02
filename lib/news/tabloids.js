var repository = require('./news-repository');

function findNews(tabloid, callback) {
  repository.find({
    'edition': tabloid.edition
  }, null, null, null, callback);
}

module.exports = {
  findNews: findNews
};

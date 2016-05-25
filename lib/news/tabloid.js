var repository = require('./news-repository');

function findNews(tabloid, callback) {
  repository.find({
    '_id': tabloid._id
  }, null, null, null, callback);
}

module.exports = {
  findNews: findNews
};

var _ = require('underscore');

function getData(news) {
  var newsObject = news.toObject ? news.toObject() : news;

  return _.chain(newsObject)
    .assign(
      newsObject.metadata,
      getExtraData(news)
    )
    .omit('metadata', 'body', '_id', '__v')
    .value();
}

function getExtraData(news) {
  return {
    date: news.published_at
  };
}

module.exports = {
  getData: getData
};

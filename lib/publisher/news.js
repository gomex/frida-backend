var _ = require('underscore');

function getData(news) {
  if (news.toObject) {
    news = news.toObject();
  }

  return _.chain({date: news.published_at})
    .assign(news, news.metadata)
    .omit('metadata', 'body', '_id', '__v')
    .value();
}

module.exports = {
  getData: getData
};

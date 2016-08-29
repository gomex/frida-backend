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
    date: news.published_at,
    other_news: getOtherNewsData(news)
  };
}

function getOtherNewsData(news) {
  return _.map(news.other_news, (news) => {
    return getData(news);
  });
}

module.exports = {
  getData: getData
};

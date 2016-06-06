var _ = require('underscore');
var publisherNews = require('./news');

function getData(tabloid) {
  return Object.assign({
    areas: getAreas(tabloid)
  }, getTabloidData(tabloid));
}

function getAreas(tabloid) {
  var news = tabloid.news ? tabloid.news.reverse() : null;
  return _.chain(news)
    .groupBy('regional_area')
    .mapObject(toArea)
    .values().value();
}

function getTabloidData(tabloid) {
  return _.omit(publisherNews.getData(tabloid), 'news');
}

function toArea(val, key) {
  return {
    name: key,
    news: getNewsData(val)
  };
}

function getNewsData(news) {
  return _.map(news, (news) => publisherNews.getData(news));
}

module.exports = {
  getData: getData
};

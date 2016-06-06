var _ = require('underscore');
var publisherNews = require('./news');

function getDataFile(tabloid) {
  return Object.assign({
    areas: getAreas(tabloid)
  }, publisherNews.getData(tabloid));
}

function getAreas(tabloid) {
  return _.chain(tabloid.news)
    .groupBy('regional_area')
    .mapObject(toArea)
    .values().value();
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
  getDataFile: getDataFile
};

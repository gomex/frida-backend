var _ = require('underscore');

var postPresenter = require('./post');
var coverPresenter = require('./cover');

function getData(tabloid) {
  return Object.assign(
    {
      title: tabloid.metadata.title,
      layout: tabloid.metadata.layout,
      display_area: tabloid.metadata.display_area,
      url: tabloid.metadata.url,
      path: tabloid.metadata.url,
      cover: tabloid.metadata.cover,
      date: tabloid.published_at,
      published_at: tabloid.published_at,
      issuu: tabloid.issuu,
      edition: tabloid.edition,
      areas: getAreas(tabloid)
    },
    coverPresenter.getData(tabloid)
  );
}

function getAreas(tabloid) {
  var news = tabloid.news ? tabloid.news.reverse() : null;
  return _.chain(news)
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
  return _.map(news, (news) => postPresenter.getListData(news));
}

function getListData(tabloid) {
  return {
    title: tabloid.metadata.title,
    display_area: tabloid.metadata.display_area,
    url: tabloid.metadata.url,
    path: tabloid.metadata.url
  };
}

module.exports = {
  getData: getData,
  getListData: getListData
};

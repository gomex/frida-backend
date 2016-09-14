var postPresenter = require('./post');
var _ = require('underscore');

function getData(tabloid) {
  return Object.assign({
    title: tabloid.metadata.title,
    layout: tabloid.metadata.layout,
    display_area: tabloid.metadata.display_area,
    url: tabloid.metadata.url,
    cover: tabloid.metadata.cover,
    date: tabloid.published_at,
    published_at: tabloid.published_at,
    issuu: tabloid.issuu,
    edition: tabloid.edition,
    areas: getAreas(tabloid)
  }, getCover(tabloid));
}

function getCover(tabloid) {
  if (tabloid.metadata.cover) {
    return {
      cover: {
        link: tabloid.metadata.cover.link,
        thumbnail: tabloid.metadata.cover.thumbnail,
        medium: tabloid.metadata.cover.medium,
        small: tabloid.metadata.cover.small,
        title: tabloid.metadata.cover.title,
        credits: tabloid.metadata.cover.credits,
        subtitle: tabloid.metadata.cover.subtitle
      }
    };
  } else {
    return {};
  }
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

module.exports = {
  getData: getData
};

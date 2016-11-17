var presenters = require('../presenter');
var _ = require('underscore');

var MAX_NEWS = 20;

function getData(home) {
  return {
    layout: 'radioagencia',
    path: '/radioagencia',
    latest_news: getLatestNews(home),
    featured_01: presenters.of(home.featured_01).getListData(home.featured_01)
  };
}

function getLatestNews(home) {
  var latest_news = _.map(home.latest_news, (item) => presenters.of(item).getListData(item));
  latest_news = _.filter(latest_news, (item) => item.title != home.featured_01.metadata.title);
  latest_news = latest_news.slice(0, MAX_NEWS);
  return latest_news;
}

module.exports = {
  getData: getData
};

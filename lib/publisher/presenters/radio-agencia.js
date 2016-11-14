var presenters = require('../presenter');
var _ = require('underscore');

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
  return latest_news;
}

module.exports = {
  getData: getData
};

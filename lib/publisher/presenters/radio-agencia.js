var presenters = require('../presenter');
var _ = require('underscore');

function getData(home) {
  return {
    layout: 'radioagencia',
    latest_news: _.map(home.latest_news, (item) => presenters.of(item).getListData(item)),
    featured_01: presenters.of(home.featured_01).getListData(home.featured_01)
  };
}

module.exports = {
  getData: getData
};

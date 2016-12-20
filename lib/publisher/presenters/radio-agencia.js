var presenters = require('../presenter');
var _ = require('underscore');

function getData(home) {
  return {
    layout: 'radioagencia',
    path: '/radioagencia',
    latest_news: _.map(home.latest_news, (item) => presenters.of(item).getListData(item)),
    featured_01: presenters.of(home.featured_01).getListData(home.featured_01),
    service_01: presenters.of(home.service_01).getListData(home.service_01),
    service_02: presenters.of(home.service_02).getListData(home.service_02),
    service_03: presenters.of(home.service_03).getListData(home.service_03),
    service_04: presenters.of(home.service_04).getListData(home.service_04),
    service_05: presenters.of(home.service_05).getListData(home.service_05)
  };
}

module.exports = {
  getData: getData
};

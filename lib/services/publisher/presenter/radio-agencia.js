var presenters = require('lib/services/publisher/presenter');
var _ = require('underscore');

function getData(home) {
  return {
    layout: 'radioagencia',
    path: '/radioagencia',
    latest_news: _.map(home.latest_news, (item) => presenters.of(item).getListData(item)),
    featured_01: getListData(home.featured_01),
    column_01: getListData(home.column_01),
    column_02: getListData(home.column_02),
    article: getListData(home.article),
    service_01: getListData(home.service_01),
    service_02: getListData(home.service_02),
    service_03: getListData(home.service_03),
    service_04: getListData(home.service_04),
    service_05: getListData(home.service_05),
    radio_01: getListData(home.radio_01),
    radio_02: getListData(home.radio_02)
  };
}

var getListData = (news) => {
  return news ? presenters.getListData(news) : null;
};

module.exports = {
  getData: getData
};

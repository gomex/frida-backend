var presenters = require('../presenter');
var _ = require('underscore');

function getData(home) {
  home.most_read = _.compact([
    home.mostread_01 || null,
    home.mostread_02 || null,
    home.mostread_03 || null,
    home.mostread_04 || null,
    home.mostread_05 || null], null);

  return {
    layout: 'national',
    path: '/',

    featured_01: getListData(home.featured_01),
    featured_02: getListData(home.featured_02),
    featured_03: getListData(home.featured_03),
    featured_04: getListData(home.featured_04),
    featured_05: getListData(home.featured_05),
    featured_06: getListData(home.featured_06),
    featured_07: getListData(home.featured_07),
    featured_08: getListData(home.featured_08),
    featured_09: getListData(home.featured_09),
    featured_10: getListData(home.featured_10),
    featured_11: getListData(home.featured_11),
    featured_12: getListData(home.featured_12),

    column_01: getListData(home.column_01),
    column_02: getListData(home.column_02),
    column_03: getListData(home.column_03),

    photo_caption: getListData(home.photo_caption),

    spotlight_01: getListData(home.spotlight_01),
    spotlight_02: getListData(home.spotlight_02),
    spotlight_03: getListData(home.spotlight_03),

    advertising_01: getListData(home.advertising_01),
    advertising_02: getListData(home.advertising_02),
    advertising_03: getListData(home.advertising_03),
    advertising_04: getListData(home.advertising_04),
    advertising_05: getListData(home.advertising_05),
    advertising_06: getListData(home.advertising_06),
    advertising_07: getListData(home.advertising_07),

    last_news: getLatestNews(home.last_news),

    most_read: getLatestNews(home.most_read)
  };
}

function getAdvertisingData(home) {
  return {
    advertising_01: getListData(home.advertising_01),
    advertising_02: getListData(home.advertising_02),
    advertising_03: getListData(home.advertising_03),
    advertising_04: getListData(home.advertising_04),
    advertising_05: getListData(home.advertising_05),
    advertising_06: getListData(home.advertising_06),
    advertising_07: getListData(home.advertising_07),
  };
}

var getLatestNews = (list) => {
  return _.map(list, (item) => presenters.getListData(item));
};

var getListData = (news) => {
  return news ? presenters.getListData(news) : null;
};

module.exports = {
  getData: getData,
  getAdvertisingData: getAdvertisingData
};

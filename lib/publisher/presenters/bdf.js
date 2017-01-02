var presenters = require('../presenter');
var _ = require('underscore');

function getData(home) {
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

    column_01: getListData(home.column_01),
    column_02: getListData(home.column_02),
    column_03: getListData(home.column_03),

    photo_caption: getListData(home.photo_caption),

    spotlight_01: getListData(home.spotlight_01),
    spotlight_02: getListData(home.spotlight_02),
    spotlight_03: getListData(home.spotlight_03),

    ceara: getListData(home.tabloid_ce),
    minas_gerais: getListData(home.tabloid_mg),
    parana: getListData(home.tabloid_pr),
    pernambuco: getListData(home.tabloid_pe),
    rio_de_janeiro: getListData(home.tabloid_rj),

    last_news: getLatestNews(home.last_news),

    most_read: getLatestNews(home.most_read)
  };
}

var getLatestNews = (list) => {
  return _.map(list, (item) => presenters.getListData(item));
};

var getListData = (news) => {
  return news ? presenters.getListData(news) : null;
};

module.exports = {
  getData: getData
};

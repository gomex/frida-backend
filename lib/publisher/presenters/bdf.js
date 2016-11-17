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

    column_01: getOptionalListData(home.column_01),
    column_02: getOptionalListData(home.column_02),
    column_03: getOptionalListData(home.column_03),

    photo_caption: getListData(home.photo_caption),

    spotlight_01: getOptionalListData(home.spotlight_01),
    spotlight_02: getOptionalListData(home.spotlight_02),
    spotlight_03: getOptionalListData(home.spotlight_03),

    ceara: getOptionalListData(home.tabloid_ce),
    minas_gerais: getOptionalListData(home.tabloid_mg),
    parana: getOptionalListData(home.tabloid_pr),
    pernambuco: getOptionalListData(home.tabloid_pe),
    rio_de_janeiro: getOptionalListData(home.tabloid_rj),

    last_news: getLatestNews(home)
  };
}

var getLatestNews = (home) => {
  return _.map(home.last_news, (item) => presenters.getListData(item));
};

var getOptionalListData = (news) => {
  return news ? presenters.getListData(news) : null;
};

var getListData = (news) => {
  return presenters.getListData(news);
};

module.exports = {
  getData: getData
};

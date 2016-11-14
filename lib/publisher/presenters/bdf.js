var presenters = require('../presenter');
var _ = require('underscore');

function getData(home) {
  return {
    layout: 'national',
    path: '/',

    featured_01: presenters.getListData(home.featured_01),
    featured_02: presenters.getListData(home.featured_02),
    featured_03: presenters.getListData(home.featured_03),
    featured_04: presenters.getListData(home.featured_04),
    featured_05: presenters.getListData(home.featured_05),
    featured_06: presenters.getListData(home.featured_06),
    featured_07: presenters.getListData(home.featured_07),
    featured_08: presenters.getListData(home.featured_08),

    column_01: presenters.getListData(home.column_01),
    column_02: presenters.getListData(home.column_02),
    column_03: presenters.getListData(home.column_03),

    photo_caption: presenters.getListData(home.photo_caption),

    spotlight_01: presenters.getListData(home.spotlight_01),
    spotlight_02: presenters.getListData(home.spotlight_02),
    spotlight_03: presenters.getListData(home.spotlight_03),

    ceara: presenters.getListData(home.tabloid_ce),
    minas_gerais: presenters.getListData(home.tabloid_mg),
    parana: presenters.getListData(home.tabloid_pr),
    pernambuco: presenters.getListData(home.tabloid_pe),
    rio_de_janeiro: presenters.getListData(home.tabloid_rj),

    last_news: getLatestNews(home)
  };
}

var getLatestNews = (home) => {
  return _.map(home.last_news, (item) => presenters.getListData(item));
};

module.exports = {
  getData: getData
};
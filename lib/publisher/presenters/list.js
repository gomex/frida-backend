var _ = require('underscore');
var presenters = require('../presenter');

function getData(list) {
  var pages = _.chain(list.news).groupBy((_, i) => {
    return Math.floor(i/20);
  }).toArray().value();

  return _.map(pages, (page, i) => getPageData(list, i, page, pages.length));
}

var identifierToDisplayName = {
  'direitos_humanos': 'direitos humanos',
  'espanol': 'español',
  'ultimas_noticias': 'últimas notícias',
  'politica': 'política',
  'radio': 'rádio',
  'opiniao': 'opinião',
  'tabloid_rj': 'rio de janeiro',
  'tabloid_mg': 'minas gerais',
  'tabloid_pr': 'paraná',
  'tabloid_ce': 'ceará',
  'tabloid_pe': 'pernambuco'
};

function toDisplayName(area) {
  return identifierToDisplayName[area] || area;
}

function getPageData(list, i, page, total) {
  return {
    layout: list.layout,
    area: toDisplayName(list.area),
    list: _.map(page, (news) => presenters.getListData(news)),
    current: i,
    total: total,
    next: (i < total-1),
    prev: (i > 0)
  };
}

module.exports = {
  getData
};
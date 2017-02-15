var _ = require('underscore');
var presenters = require('../presenter');

function getData(list) {
  var pages = _.chain(list.news).groupBy((_, i) => {
    return Math.floor(i/20);
  }).toArray().value();

  return _.map(pages, (page, i) => getPageData(list, i, page, pages.length));
}

var identifierToDisplayName = {
  direitos_humanos: 'direitos humanos',
  espanol: 'español',
  ultimas_noticias: 'últimas notícias',
  politica: 'política',
  radio: 'rádio',
  opiniao: 'opinião',
  tabloid_rj: 'rio de janeiro',
  tabloid_mg: 'minas gerais',
  tabloid_pr: 'paraná',
  tabloid_ce: 'ceará',
  tabloid_pe: 'pernambuco',
  hojenahistoria: 'hoje na história',
  alimentoesaude: 'alimento e saude',
  nossosdireitos: 'nossos direitos',
  fatoscuriosos: 'fatos curiosos da história',
  mosaicocultural: 'mosaico cultural'
};

function toDisplayName(area) {
  return identifierToDisplayName[area] || area || null;
}

function getPageData(list, i, page, total) {
  return {
    layout: list.layout,
    path: list.path,
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

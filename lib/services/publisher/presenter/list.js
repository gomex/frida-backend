var _ = require('underscore');
var presenters = require('lib/services/publisher/presenter');

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
  alimentoesaude: 'alimento e saude',
  mosaicocultural: 'mosaico cultural',
  conectados: 'conectados',
  momentoagroecologico: 'momento agroecológico',
  falaai: 'fala aí',
  programasemanal: 'programa semanal'
};

function toDisplayName(area) {
  return identifierToDisplayName[area] || area || null;
}

function getPageData(list, i, page, total) {
  return {
    layout: list.layout,
    path: list.path,
    area: toDisplayName(list.area),
    list: _.map(page, (news) => getListData(news, list.area)),
    current: i,
    total: total,
    next: (i < total-1),
    prev: (i > 0)
  };
}

function getListData(news, area) {
  var options = {
    content: area == 'ultimas_noticias'
  };
  return presenters.getListData(news, options);
}

module.exports = {
  getData
};

var _ = require('underscore');
var presenters = require('../presenter');

function getData(list) {
  var pages = _.chain(list.news).groupBy((_, i) => {
    return Math.floor(i/20);
  }).toArray().value();

  return _.map(pages, (page, i) => getPageData(list, i, page, pages.length));
}

function getPageData(list, i, page, total) {
  return {
    layout: list.layout,
    area: list.area,
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

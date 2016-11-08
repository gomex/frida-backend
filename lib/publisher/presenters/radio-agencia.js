var presenters = require('../presenter');

function getData(home) {
  return {
    layout: 'radio_agencia',
    featured_01: presenters.of(home.featured_01).getListData(home.featured_01)
  };
}

module.exports = {
  getData: getData
};

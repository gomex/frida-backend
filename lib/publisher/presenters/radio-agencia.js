var presenters = require('../presenter');

function getData(home) {
  return {
    layout: 'radio_agencia',
    featured_01: presenters.getListData(home.featured_01)
  };
}

module.exports = {
  getData: getData
};

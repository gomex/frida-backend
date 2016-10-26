var presenters = require('../presenter');

function getData(home) {
  return {
    layout: home.layout,
    featured_01: presenters.getListData(home.featured_01)
  };
}

module.exports = {
  getData: getData
};

var presenters = require('../presenter');

function getData(home) {
  return {
    layout: home.name,
    featured_01: presenters.getListData(home.featured_01)
  };
}

module.exports = {
  getData: getData
};

var _ = require('underscore');
var presenter = require('./advertising');

function getData(advertisings) {
  return _.reduce(advertisings, (memo, advertising) => {
    memo[advertising.metadata.display_area] = presenter.getData(advertising);
    return memo;
  }, {});
}

module.exports = {
  getData: getData
};

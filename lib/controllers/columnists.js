var columnistRepository = require('../columnist/columnist-repository');
var helper   = require('./helper');

var getAllColumnists = function(req, res) {
  columnistRepository.getAll(function(result) {
    helper.sendResponse(res, 200, result);
  });
};

module.exports = {
  getAllColumnists: getAllColumnists
};

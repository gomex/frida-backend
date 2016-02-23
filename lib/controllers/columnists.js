var columnistRepository = require('../columnist/columnist-repository');
var controllersHelper   = require('./controllers-helper');

var getAllColumnists = function(req, res) {
  columnistRepository.getAll(function(result) {
    controllersHelper.buildSendResponse(res, 200, result);
  });
};

module.exports = {
  getAllColumnists: getAllColumnists
};

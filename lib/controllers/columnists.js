var columnistRepository = require('../columnist/columnist-repository');

var getAllColumnists = function(req, res) {
  columnistRepository.getAll(function(result) {
    res.statusCode = 200;
    res.json(result);
  });
};

module.exports = {
  getAllColumnists: getAllColumnists
};

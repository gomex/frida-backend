var Home = require('../models/home');
var helper = require('./helper');

function findByName(req, res) {
  Home.findByName(req.params.name, (err, home) => {
    if (err) {
      return helper.sendError(res, 404, err);
    }

    helper.sendResponse(res, 200, home);
  });
}

module.exports = {
  findByName: findByName
};

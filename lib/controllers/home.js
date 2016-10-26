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

function update(req, res) {
  Home.findByName(req.params.name, (err, home) => {
    if (err) {
      return helper.sendError(res, 404, err);
    }

    Object.assign(home, req.body);

    home.save((err, updated) => {
      if (err) {
        return helper.sendError(res, 500, err);
      }
      helper.sendResponse(res, 200, updated);
    });
  });
}

module.exports = {
  findByName: findByName,
  update: update
};

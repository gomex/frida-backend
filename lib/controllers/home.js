var Home = require('../models/home');
var helper = require('./helper');

function findByName(req, res, next) {
  Home.findByName(req.params.name, (err, home) => {
    if (err) return next({status: 404, error: err});

    helper.sendResponse(res, 200, home);
  });
}

function update(req, res, next) {
  Home.findByName(req.params.name, (err, home) => {
    if (err) return next({status: 404, error: err});

    Object.assign(home, req.body)
      .save((err, updated) => {
        if (err) return next({status: 500, error: err});

        helper.sendResponse(res, 200, updated);
      });
  });
}

module.exports = {
  findByName: findByName,
  update: update
};

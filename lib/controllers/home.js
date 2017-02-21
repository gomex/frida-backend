var Home = require('../models/home');
var helper = require('./helper');
var publisher = require('../models/publisher');

function findByName(req, res, next) {
  Home.findByName(req.params.name, (err, home) => {
    if (err) return next({status: 500, error: err});
    if (!home) return next({status: 404, error: 'Not Found'});

    helper.sendResponse(res, 200, home);
  });
}

function update(req, res, next) {
  Home.findByName(req.params.name, (err, home) => {
    if (err) return next({status: 500, error: err});
    if (!home) return next({status: 404, error: 'Not Found'});

    Object.assign(home, req.body).save((err, updated) => {
      if (err) return next({status: 500, error: err});

      var clone = updated.toObject();
      publisher.publishHome(updated, true, (err) => {
        if (err) return next({status: 500, error: err});
        helper.sendResponse(res, 200, clone);
      });
    });
  });
}

module.exports = {
  findByName: findByName,
  update: update
};

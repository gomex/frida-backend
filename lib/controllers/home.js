var Home = require('lib/models/home');
var helper = require('lib/controllers/helper');
var worker = require('lib/services/publisher/worker');

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

      worker.publishLater([''], true, (err) => {
        if (err) return next({status: 500, error: err});

        helper.sendResponse(res, 200, updated);
      });
    });
  });
}

module.exports = {
  findByName: findByName,
  update: update
};

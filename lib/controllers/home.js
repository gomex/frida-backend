var Home = require('../models/home');

function findByName(req, res) {
  Home.findByName(req.params.name, (err, home) => {
    res.statusCode = 200;
    res.json(home);
  });
}

module.exports = {
  findByName: findByName
};

var helper   = require('./helper');

var authenticated = function(req, res) {
  helper.sendResponse(res, 200, { success: true });
};

module.exports = {
  authenticated: authenticated
};

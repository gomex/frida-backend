var controllersHelper   = require('./controllers-helper');

var authenticated = function(req, res) {
  controllersHelper.buildSendResponse(res, 200, { success: true });
};

module.exports = {
  authenticated: authenticated
};

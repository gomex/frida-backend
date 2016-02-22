
var authenticated = function(req, res) {
  return res.json({ success: true });
};

module.exports = {
  authenticated: authenticated
};

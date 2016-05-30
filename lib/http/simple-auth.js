'use strict';

var auth = require('basic-auth');

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

var usersAndPasswords = [EDITOR];

module.exports = function(req, res, next) {
  var credentials = auth(req);
  var authenticated = function(credentials){
    return usersAndPasswords.filter(function(registeredUser) {
      return credentials.name === registeredUser.username && credentials.pass === registeredUser.password;
    }).length === 1;
  };

  if (!credentials || !authenticated(credentials)) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  } else {
    next();
  }
};

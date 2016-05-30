'use strict';

var passport        = require('passport');
var BasicStrategy   = require('passport-http').BasicStrategy;

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

passport.use(new BasicStrategy(
  function(user, password, done) {

    if(user === EDITOR.username && password === EDITOR.password)
      return done(null, EDITOR);
    else
      return done(null, false);
  }
));

var passportStrategy = passport.authenticate('basic', { session: false });

module.exports = function(req, res, next) {
  if(req.method === 'OPTIONS') {
    next();
  } else {
    passportStrategy(req, res, next);
  }
};

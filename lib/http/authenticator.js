'use strict';

var passport        = require('passport');
var BasicStrategy   = require('passport-http').BasicStrategy;
var User            = require('lib/models/user');

passport.use(new BasicStrategy(
  function(userEmail, password, done) {
    User.findOne({ email: userEmail }, (error, foundUser) => {
      if(error) return done(error, null);
      if(!foundUser) return done(null, false);

      foundUser.verifyPassword(password, (error, verified) => {
        if(error) return done(error, null);

        if(verified) {
          done(null, foundUser);
        } else {
          done(null, false);
        }
      });
    });
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

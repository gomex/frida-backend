'use strict';

var passport        = require('passport');
var BasicStrategy   = require('passport-http').BasicStrategy;
var User            = require('../models/user');

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

passport.use(new BasicStrategy(
  function(user, password, done) {
    if(process.env.MULTIPLE_USERS_ENABLED) {
      brandNewAuthentication(user, password, done);
    } else {
      oldFashionedAuthentication(user, password, done);
    }
  }
));

function brandNewAuthentication(userEmail, password, done) {
  User.findOne({ email: userEmail }, (error, foundUser) => {
    if(error) return done(error, null);
    if(!foundUser) return done(null, false);

    foundUser.verifyPassword(password, (error, verified) => {
      if(error) done(error, null);

      if(verified) {
        done(null, foundUser);
      } else {
        done(null, false);
      }
    });
  });
}

function oldFashionedAuthentication(user, password, done) {
  if(user === EDITOR.username && password === EDITOR.password)
    return done(null, EDITOR);
  else
    return done(null, false);
}

var passportStrategy = passport.authenticate('basic', { session: false });

module.exports = function(req, res, next) {
  if(req.method === 'OPTIONS') {
    next();
  } else {
    passportStrategy(req, res, next);
  }
};

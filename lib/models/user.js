'use strict';

var mongoose  = require('mongoose');
var password  = require('password-hash-and-salt');

var userSchema = mongoose.Schema({
  'name': {
    type: String,
    required: true
  },
  'email': {
    type: String,
    validate: {
      validator: isEmailValid,
      message: '{VALUE} is not a valid email address'
    },
    required: true
  },
  'hashed_password': {
    type: String,
    required: true
  },
  'created_at': Date,
  'updated_at': Date
});

function isEmailValid(email) {
  return /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(email);
}

var User = mongoose.model('User', userSchema);

User.hash = function hash(plainPassword, cb) {
  password(plainPassword).hash(cb);
};

User.prototype.verifyPassword = function verifyPassword(plainPassword, cb) {
  password(plainPassword).verifyAgainst(this.hashed_password, cb);
};

module.exports = User;

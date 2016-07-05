'use strict';

var User = require('../models/user');

function createUser(name, email, password, callback) {
  User.hash(password, (error, hash) => {
    if(error) callback(error, null);

    var user = new User({
      name: name,
      email: email,
      hashed_password: hash,
      created_at: Date.now(),
      updated_at: Date.now()
    });

    user.save(callback);
  });
}

module.exports = {
  createUser: createUser
};

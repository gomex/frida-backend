'use strict';

var User = require('lib/models/user');

function createUser(name, email, password, callback) {
  User.hash(password, (error, hash) => {
    if(error) callback(error, null);

    var user = new User({
      name: name,
      email: email,
      hashed_password: hash
    });

    user.save(callback);
  });
}

module.exports = {
  createUser: createUser
};

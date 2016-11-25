/*eslint no-undef: "off"*/

'use strict';

var User        = require('../../../../lib/models/user');
var UserService = require('../../../../lib/services/user');

describe('UserService', () => {

  describe('createUser', () => {
    it('creates User with the given arguments', (done) => {
      UserService.createUser('John Doe', 'user@domain.com', 'password', (error, user) => {
        expect(user).to.be.instanceof(User);
        expect(user.name).to.equal('John Doe');
        expect(user.email).to.equal('user@domain.com');
        done();
      });
    });

    it('the password saved is a hash of the plain password', (done) => {
      UserService.createUser('John Doe', 'user@domain.com', 'password', (error, user) => {
        expect(user.hashed_password).to.match(/pbkdf2\$10000\$[0-9a-fA-F]{128}\$[0-9a-fA-F]{128}/);
        done();
      });
    });

    it('sets created_at date', (done) => {
      UserService.createUser('John Doe', 'user@domain.com', 'password', (error, user) => {
        expect(user.created_at).to.exist;
        done();
      });
    });

    it('sets updated_at date', (done) => {
      UserService.createUser('John Doe', 'user@domain.com', 'password', (error, user) => {
        expect(user.updated_at).to.exist;
        done();
      });
    });
  });

});

/*eslint no-undef: "off"*/

'use strict';

var factory   = require('../../../factories/user-attributes').user;
var User      = require('../../../../lib/models/user');

describe('User', function() {

  describe('.hash', function() {

    var hashedPassword;

    beforeEach((done) => {
      User.hash('my_bad_password', (error, hash) => {
        hashedPassword = hash;
        done(error);
      });
    });

    it('result has the format pbkdf2$10000$hash$salt', (done) => {
      expect(hashedPassword).to.match(/pbkdf2\$10000\$[0-9a-fA-F]{128}\$[0-9a-fA-F]{128}/);
      done();
    });
  });

  given('user', () => new User(factory.build()));

  it('validates hashed_password is present', (done) => {
    user.hashed_password = '';

    user.validate((error) => {
      expect(error).to.not.be.empty;
      expect(error.errors['hashed_password'].message).to.equal('Path `hashed_password` is required.');
      done();
    });
  });

  it('validates name is present', (done) => {
    user.name = '';

    user.validate((error) => {
      expect(error).to.not.be.empty;
      expect(error.errors['name'].message).to.equal('Path `name` is required.');
      done();
    });
  });

  it('validates email is present', (done) => {
    user.email = '';

    user.validate((error) => {
      expect(error).to.not.be.empty;
      expect(error.errors['email'].message).to.equal('Path `email` is required.');
      done();
    });
  });

  it('validates email looks like an email address', (done) => {
    user.email = 'not_an_email';

    user.validate((error) => {
      expect(error).to.not.be.empty;
      expect(error.errors['email'].message).to.equal('not_an_email is not a valid email address');
      done();
    });
  });

  it('accepts valid email address', (done) => {
    user.email = 'email@domain.com';

    user.validate((error) => {
      expect(error).to.be.empty;
      done();
    });
  });
});
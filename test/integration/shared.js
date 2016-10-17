/*eslint no-undef: "off"*/

var UserService = require('../../lib/services/user_service');

function behavesAsAuthenticated(api) {
  describe('when credentials are not sent', () => {
    subj('auth', () => api().send());

    it('fails', (done) => {
      auth
        .expect(401)
        .end(done);
    });
  });

  describe('when credentials are wrong', () => {
    subj('auth', () => api().auth('bla', 'bla').send());

    it('fails', (done) => {
      auth
        .expect(401)
        .end(done);
    });
  });
}

function createUser(done) {
  UserService.createUser('User', 'user@user.com', 'password', (err) => {
    process.env['EDITOR_USERNAME'] = 'user@user.com';
    process.env['EDITOR_PASSWORD'] = 'password';
    done(err);
  });
}

module.exports = {
  behavesAsAuthenticated: behavesAsAuthenticated,
  createUser: createUser
};

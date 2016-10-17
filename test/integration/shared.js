/*eslint no-undef: "off"*/

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
};

module.exports = {
  behavesAsAuthenticated: behavesAsAuthenticated
}

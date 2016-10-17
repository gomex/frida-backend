/*eslint no-undef: "off"*/

var server = require('../../lib/http/server');
var supertest   = require('supertest');
var shared = require('./shared');

describe('/homes', () => {
  given('api', () => supertest('https://localhost:5000'));
  given('name', () => 'some_name');

  before((done) => {
    server.startServer();
    done();
  });

  beforeEach((done) => {
    shared.createUser(done);
  });

  describe('GET /:name', () => {
    var subject = () => {
      return api.get(`/homes/${name}`)
        .send()
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    shared.behavesAsAuthenticated(() =>
      api.get(`/homes/${name}`)
    );

    it('succeeds', (done) => {
      subject()
        .expect(200)
        .end(done);
    });
  });
});

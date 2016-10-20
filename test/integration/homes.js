/*eslint no-undef: "off"*/

var server = require('../../lib/http/server');
var supertest   = require('supertest');
var shared = require('./shared');
var Home = require('../../lib/models/home');

describe('/homes', () => {
  given('api', () => supertest('https://localhost:5000'));

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

    var home;

    given('name', () => 'some_name');

    beforeEach((done) => {
      Home.create({name: name}, (err, result) => {
        home = result;
        done(err);
      });
    });

    shared.behavesAsAuthenticated(() =>
      api.get(`/homes/${name}`)
    );

    it('succeeds', (done) => {
      subject()
        .expect(200)
        .end(done);
    });

    it('returns home', (done) => {
      subject()
        .expect(200)
        .end((err, res) => {
          expect(res.body._id).to.equal(home.id);
          expect(res.body.name).to.equal(home.name);

          done(err);
        });
    });
  });
});

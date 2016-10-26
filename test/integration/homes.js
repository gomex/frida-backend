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

    describe('when is not found', () => {
      given('name', () => 'absent_name');

      it('returns 404', (done) => {
        subject()
          .expect(404)
          .end(done);
      });
    });
  });

  describe('PUT /:name', () => {
    var subject = () => {
      return api.put(`/homes/${home.name}`)
        .send(updatedHome)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    given('home', () => ({
      name: 'some_name'
    }));
    given('updatedHome', () => Object.assign(home, {featured_01: '123456789012345678901234'}));

    beforeEach((done) => {
      Home.create(home, done);
    });

    shared.behavesAsAuthenticated(() =>
      api.get(`/homes/${home.name}`)
    );

    it('succeeds', (done) => {
      subject()
        .expect(200)
        .end(done);
    });

    it('returns updated home', (done) => {
      subject()
        .expect(200)
        .end((err, res) => {
          expect(res.body.featured_01).to.equal(updatedHome.featured_01);

          done(err);
        });
    });
  });
});

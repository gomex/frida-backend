/*eslint no-undef: "off"*/

var server = require('../../lib/http/server');
var supertest   = require('supertest');
var shared = require('./shared');
var Home = require('../../lib/models/home');
var News = require('../../lib/models/news');
var publisher = require('../../lib/services/publisher');
var worker = require('../../lib/services/publisher/worker');
var postFactory = require('../factories/post-attributes').post;
var async = require('async');

describe('/homes', () => {
  given('api', () => supertest('https://localhost:5000'));

  before((done) => {
    server.start();
    done();
  });

  beforeEach((done) => {
    shared.createUser(done);
  });

  beforeEach(Home.init);

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
    given('post', () => postFactory.build({status: 'draft'}));
    var updatedHome;

    beforeEach((done) => {
      sandbox.spy(worker, 'publishLater');

      async.series([
        (callback) => Home.create(home, callback),
        (callback) => News.create(post, (err, post) => {
          updatedHome = Object.assign({featured_01: post.id}, home);
          publisher.publish(post, callback);
        })
      ], done);
    });

    shared.behavesAsAuthenticated(() =>
      api.get(`/homes/${home.name}`)
    );

    it('succeeds', (done) => {
      subject()
        .expect(200)
        .end(done);
    });

    it('updates home', (done) => {
      subject()
        .expect(200)
        .end((err) => {
          if(err) return done(err);

          Home.findByName(home.name, (err, res) => {
            expect(res.featured_01.toString()).to.equal(updatedHome.featured_01);

            done(err);
          });
        });
    });

    it('saves home', (done) => {
      subject()
        .expect(200)
        .end((err, res) => {
          expect(res.body.featured_01).to.equal(updatedHome.featured_01);

          done(err);
        });
    });

    it('returns updated home', (done) => {
      subject()
        .expect(200)
        .end((err, res) => {
          expect(res.body.featured_01).to.equal(updatedHome.featured_01);

          done(err);
        });
    });

    it('increments version', (done) => {
      subject()
        .expect(200)
        .end((err, res) => {
          expect(res.body.__v).to.equal(1);

          done(err);
        });
    });

    it('schedules generate', (done) => {
      subject()
        .expect(200)
        .end((err) => {
          expect(worker.publishLater).to.have.been.called;

          done(err);
        });
    });
  });
});

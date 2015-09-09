var assert = require('assert'),
    CONFIG = require('../helpers/config'),
    supertest = require('supertest'),
    postsRepository = require(CONFIG.ROOT_DIRECTORY + '/lib/posts-repository')(),
    api = supertest('http://localhost:5000')
;

describe('Posts:', function() {
  var rawData,
      postId,
      URL,
      API = '/api/organization/';

  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/server').startServer();

    rawData =  {
        body: '',
        metadata: {}
    };

    URL = {
      get :  API + 'brasil-de-fato/site/posts',
      insert :  API + 'brasil-de-fato/site/posts'
    };

    postsRepository.insert(rawData, function(id) {
      postId = id;
      done();
    });
  });

  after(function(done) {
    postsRepository.deleteById(postId, function(err){
      done();
    });
  });

  it('POST: /api/organization/:organization/:repository/posts', function(done) {
    var raw = {
      body: 'qualquer coisa',
      metadata: JSON.stringify({ algo: 12})
    };

    api.post(URL.insert)
        .send(raw)
        .expect(201)
        .end(function(err, res) {
          var id = res.body.id;
          assert(typeof id !== 'undefined');

          postsRepository.findById(id, function(result) {
            assert.equal(typeof result._id !== 'undefined', true);
            assert.equal(typeof result.metadata === 'object', true);
            assert.equal(result.metadata.algo, 12);

            postsRepository.deleteById(id, function(err) {
              done();
            });
          });
        });
  });

  it('GET: /api/organization/:organization/:repository/posts?:filters', function(done){

    api.get(URL.get + '?year=' + CONFIG.YEAR + '&month=' + CONFIG.MONTH)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {

        if (err) {
          return done(err);
        }

        assert(res.body instanceof Array);

        res.body.forEach(function (response) {
          assert.equal(typeof response._id !== 'undefined', true);
          assert.equal(typeof response.insertDate !== 'undefined', true);
          assert.equal(typeof response.metadata !== 'undefined', true);
          assert.equal(typeof response.body !== 'undefined', true);
        });

        done();
      });
  });

  it('GET: /api/organization/:organization/:repository/posts', function(done){

    api.get(URL.get)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {

        if (err) {
          return done(err);
        }

        assert(res.body instanceof Array);

        res.body.forEach(function (response) {
          assert.equal(typeof response._id !== 'undefined', true);
          assert.equal(typeof response.insertDate !== 'undefined', true);
          assert.equal(typeof response.metadata !== 'undefined', true);
          assert.equal(typeof response.body !== 'undefined', true);
        });

        done();
      });
  });

  it('PUT: /api/organization/:organization/:repository/posts/<id>', function(done) {
    rawData.test = 'test';
    api.put(URL.get + '/' + postId)
        .send(rawData)
        .expect(204)
        .end(done);

  });
});

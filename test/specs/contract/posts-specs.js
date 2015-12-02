var assert = require('assert'),
    CONFIG = require('../helpers/config'),
    supertest = require('supertest'),
    postsRepository = require(CONFIG.ROOT_DIRECTORY + '/lib/posts-repository')(),
    api = supertest('https://localhost:5000'),
    moment = require('moment'),
    PostUtil = require(CONFIG.ROOT_DIRECTORY + '/lib/post-util');


describe('Posts:', function() {
  var rawData,
      postId,
      URL,
      API = '/api/organization/';

  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/http/server').startServer();

    rawData =  {
        body: '',
        metadata: {title: 'titulo-sensacionalista' + new Date().getTime()}
    };

    URL = {
      get :  API + 'brasil-de-fato/site/posts',
      insert :  API + 'brasil-de-fato/site/posts'
    };

    postsRepository.insert(PostUtil.prepare(rawData), function(id) {
      postId = id;
      done();
    });
  });

  beforeEach(function(done) {
    rawData =  {
        body: '',
        metadata: {}
    };
    done();
  });

  after(function(done) {
    postsRepository.deleteById(postId, function(err){
      done();
    });
  });

  describe('insert news using POST contract', function() {
    it('POST: /api/organization/:organization/:repository/posts', function(done) {
      var raw = {
        body: 'qualquer coisa',
        metadata: JSON.stringify({ algo: 12})
      };

      var callback = function(err, res) {
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
      };

      api.post(URL.insert)
        .send(raw)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callback);
    });

    it('create url using title', function(done) {
      var raw = {
        body: 'qualquer coisa',
        metadata: JSON.stringify({ title: 'Barragem Estoura', date: '2014-08-25T15:32:36-03:00'})
      };

      var callback = function(err, res) {
        var id = res.body.id;

        postsRepository.findById(id, function(result) {
          assert.equal(result.metadata.url, '2014/08/25/barragem-estoura/');


          postsRepository.deleteById(id, function(err) {
            done();
          });
        });
      };

      api.post(URL.insert)
        .send(raw)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callback);
    });
  });

  it('GET: /api/organization/:organization/:repository/posts?:filters', function(done){

    api.get(URL.get + '?year=' + CONFIG.YEAR + '&month=' + CONFIG.MONTH)
      .expect(200)
      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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
      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

    var title = 'titulo-sensacionalista' + new Date().getTime();
    rawData.metadata = JSON.stringify({title: title});

    api.put(URL.get + '/' + postId)
      .send(rawData)
      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
      .expect(204)
      .end(function(err) {

        postsRepository.findById(postId, function(result) {

          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(typeof result.metadata === 'object', true);
          assert.equal(result.metadata.title === title, true);
          done();
        });
      });
  });

  describe('Change status', function(){
    var postIdent, month, year;
    beforeEach(function(done) {
      rawData =  {
        body: '',
        metadata: {title: 'titulo-sensacionalista' + new Date().getTime()}
      };
      month = moment().format('MM');
      year  = moment().format('YYYY');

      postsRepository.insert(PostUtil.prepare(rawData), function(result) {
        postIdent = result;

        done();
      });
    });

    it('PUT: /api/organization/:organization/:repository/posts/<id>/status/<draft>', function(done) {
      var expectedPath = '';

      api.put(URL.get + '/' + postIdent + '/status/draft')
      .expect(202)
      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
      .end(function(err, result) {
        assert.equal(expectedPath, result.body.path);
        postsRepository.findById(postIdent, function(result) {
          assert.equal('draft', result.status);
          done();
        });
      });
    });

    it('PUT: /api/organization/:organization/:repository/posts/<id>/status/<published>', function(done) {
      var expectedPath = [year, month, postIdent + '.md'].join('/');

      api.put(URL.get + '/' + postIdent + '/status/published')
      .expect(202)
      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
      .end(function(err, result) {
        assert.equal(expectedPath, result.body.path);
        postsRepository.findById(postIdent, function(result) {
          assert.equal('published', result.status);
          done();
        });
      });
    });

  });
});

var assert = require('assert'),
    CONFIG = require('../helpers/config'),
    supertest = require('supertest'),
    postsRepository = require(CONFIG.ROOT_DIRECTORY + '/lib/posts-repository')(),
    api = supertest('http://localhost:5000')
;

describe('Posts:', function() {
  var post,
      postId,
      URL = '/api/organization/';

  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/server').startServer();

    post = {
      name: 'Name',
      path: 'Path',
      sha: 'sha',
      organization: 'organization-test',
      repository: 'repository-test',
      year: CONFIG.YEAR,
      month: CONFIG.MONTH
    };

    URL += post.organization + '/' + post.repository + '/posts';

    postsRepository.insert(post, function(id) {
      postId = id;
      done();
    });
  });

  after(function(done) {
    postsRepository.deleteById(postId, function(err, res){
      done();
    });
  });

  it('GET: /api/organization/:organization/:repository/posts/:year/:month', function(done){

    api.get(URL + '/' + CONFIG.YEAR + '/' + CONFIG.MONTH)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {

        if (err) {
          return done(err);
        }

        assert(res.body instanceof Array);

        res.body.forEach(function (response) {
          assert.equal(typeof response.name !== 'undefined', true);
          assert.equal(typeof response.path !== 'undefined', true);
          assert.equal(typeof response.sha !== 'undefined', true);
        });

        done();
      });
  });

  it('GET: /api/organization/:organization/:repository/posts', function(done){

    api.get(URL)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {

        if (err) {
          return done(err);
        }

        assert(res.body instanceof Array);

        res.body.forEach(function (response) {
          assert.equal(typeof response.name !== 'undefined', true);
          assert.equal(typeof response.path !== 'undefined', true);
          assert.equal(typeof response.sha !== 'undefined', true);
        });

        done();
      });
  });
});

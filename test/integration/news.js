var fs = require('fs');
var grayMatter = require('gray-matter');
var slug = require('slug');
var supertest = require('supertest');

var News = require('../../lib/models/news');
var Home = require('../../lib/models/home');
var publisher = require('../../lib/models/publisher');
var server = require('../../lib/http/server');
var shared = require('./shared');
var metadataFactory = require('../factories/news-attributes').metadata;
var newsFactory = require('../factories/news-attributes').news;
var columnFactory = require('../factories/column-attributes').column;
var photoCaptionFactory = require('../factories/photo-caption-attributes').photoCaption;
var tabloidFactory = require('../factories/tabloid-attributes').tabloid;

var api = supertest('https://localhost:5000');

describe('REST API:', function() {
  beforeEach(Home.init);

  var NEWS_RESOURCE = '/news';

  var newsYearMonthURL;
  var newsYearMonthDayURL;

  var hexoPaths = {
    sourcePath: process.env.HEXO_SOURCE_PATH + '/',
    postsPath: [process.env.HEXO_SOURCE_PATH, '_posts'].join('/')
  };

  // helper functions
  var deleteDirSync = function(path) {
    if(fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, _index) {
        var curPath = path + '/' + file;
        if(fs.lstatSync(curPath).isDirectory()) {
          deleteDirSync(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });

      fs.rmdirSync(path);
    }
  };

  var verifyColumnNewsCommonAttributes = function (actual, expected) {
    assert.equal(typeof actual._id !== 'undefined', true);
    assert.equal(actual.body, expected.body);
    assert.equal(actual.created_at.getTime(), newsCreatedAt);
    assert.equal(actual.metadata.description, expected.metadata.description);
    assert.equal(actual.metadata.hat, expected.metadata.hat);
    assert.equal(actual.metadata.layout, expected.metadata.layout);
    assert.equal(actual.metadata.title, expected.metadata.title);
  };

  var verifyNewsAttributes = function(actualNews, expectedNews){
    verifyColumnNewsCommonAttributes(actualNews, expectedNews);
    assert.equal(actualNews.metadata.area, expectedNews.metadata.area);
    assert.equal(actualNews.metadata.author, expectedNews.metadata.author);
    assert.equal(actualNews.metadata.place, expectedNews.metadata.place);
  };

  var verifyColumnAttributes = function(actualColumn, expectedColumn) {
    verifyColumnNewsCommonAttributes(actualColumn, expectedColumn);
    assert.equal(actualColumn.metadata.columnist, expectedColumn.metadata.columnist);
  };

  var buildNewsHTTPPath = function(newsTitle) {
    return newsYearMonthDayURL + slug(newsTitle, {lower: true}) + '/';
  };

  var newsCreatedAt;

  before(function(done){
    server.start();

    var testDate = new Date('Feb 14, 2016 01:15:00');

    newsYearMonthURL = '/2016/02/';
    newsYearMonthDayURL = '/2016/02/14/';

    sinon.useFakeTimers(testDate.getTime(), 'Date');
    newsCreatedAt = Date.now();

    deleteDirSync(hexoPaths.sourcePath);
    done();
  });

  beforeEach((done) => {
    shared.createUser(done);
  });

  after(function(done) {
    deleteDirSync(hexoPaths.sourcePath);
    done();
  });

  describe('POST /news', function() {
    var subject = function(news) {
      return api.post(NEWS_RESOURCE).send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    shared.behavesAsAuthenticated(() =>
      api.post(NEWS_RESOURCE)
    );

    it('persists news', function(done) {
      var news = newsFactory.build();

      subject(news)
        .expect(201)
        .end(function(err, res) {
          if(err){ done(err); }

          var newsId = res.body.id;
          assert(typeof newsId !== 'undefined');
          News.findById(newsId, function(err, result) {
            verifyNewsAttributes(result, news);
            assert.equal(result.status, 'draft');
            assert.ok(result.created_at);
            done();
          });
        });
    });

    it('persists columns', function(done) {
      var column = columnFactory.build();

      subject(column)
        .expect(201)
        .end(function(err, res) {
          if(err){ done(err); }

          var columnId = res.body.id;
          assert(typeof columnId !== 'undefined');

          News.findById(columnId, function(err, result) {
            verifyColumnAttributes(result, column);
            assert.equal(result.status, 'draft');
            done();
          });
        });
    });
  });

  describe('GET /news/<id>', function() {

    var news;
    var newsId;

    beforeEach(function(done) {
      news = newsFactory.build();
      api.post(NEWS_RESOURCE)
        .send(news)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(function(err, res) {
          if(err){
            done(err);
          } else {
            newsId = res.body.id;
            done();
          }
        });
    });

    var subject = function() {
      return api.get(NEWS_RESOURCE + '/' + newsId).send().auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    shared.behavesAsAuthenticated(() =>
      api.get(NEWS_RESOURCE + '/' + newsId)
    );

    it('retrieves previously saved news or column', function(done){
      subject()
        .expect(200)
        .end(function(err, res) {
          if(err){
            done(err);
          } else {
            var newsReturnedFromGet = res.body;
            assert.equal(newsReturnedFromGet._id, newsId);
            assert.equal(newsReturnedFromGet.metadata.area, news.metadata.area);
            assert.equal(newsReturnedFromGet.metadata.author, news.metadata.author);
            assert.equal(newsReturnedFromGet.metadata.description, news.metadata.description);
            assert.equal(newsReturnedFromGet.metadata.hat, news.metadata.hat);
            assert.equal(newsReturnedFromGet.metadata.layout, news.metadata.layout);
            assert.equal(newsReturnedFromGet.metadata.place, news.metadata.place);
            assert.equal(newsReturnedFromGet.metadata.title, news.metadata.title);
            done();
          }
        });
    });
  });

  describe('PUT /news/<id>', function() {

    var news;
    var newsId;

    var subject = function() {
      return api.put(NEWS_RESOURCE + '/' + newsId).send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    beforeEach(function(done) {
      news = newsFactory.build();
      api.post(NEWS_RESOURCE)
        .send(news)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(function(err, res) {
          if(err){
            done(err);
          } else {
            newsId = res.body.id;
            done();
          }
        });
    });

    shared.behavesAsAuthenticated(() =>
      api.put(NEWS_RESOURCE + '/' + newsId)
    );

    it('updates previously saved news', function(done){
      news.metadata.title = 'Outro Título';
      news.metadata.area = 'direitos_humanos';
      news.metadata.hat = 'Outro Chapéu';
      news.metadata.description = 'Outra Descrição';

      subject()
        .expect(200)
        .end(function(err, res) {
          if(err) return done(err);

          var id = res.body._id;
          assert(typeof id !== 'undefined');
          assert.equal(id, newsId);

          News.findById(newsId, function(err, result) {
            verifyNewsAttributes(result, news);
            done();
          });
        });
    });

    it('updates updated_at date', function(done){
      sinon.useFakeTimers(Date.now(), 'Date');

      subject()
        .expect(200)
        .end(function(err, _res) {
          if(err){ done(err); }

          News.findById(newsId, function(err, result) {
            assert.equal(result.updated_at.getTime(), Date.now());
            done();
          });
        });
    });

    it('does not set news path', function(done){
      news.metadata.url = '/bad-bad-path';

      subject()
        .expect(200)
        .end(function(err, res) {
          if(err){ done(err); }

          var id = res.body._id;
          assert(typeof id !== 'undefined');
          assert.equal(id, newsId);

          News.findById(newsId, function(err, result) {
            assert.equal(result.metadata.url, undefined);
            done();
          });
        });
    });

    it('increments version', function(done){
      subject()
        .expect(200)
        .end(function(err, res) {
          expect(res.body.__v).to.equal(1);

          done(err);
        });
    });

    it('does not reset news path for published news', function(done) {
      var now = new Date();
      var past = new Date(1000);

      var metadata = metadataFactory.build({ url: '/this-path-should-not-disappear' });
      var news = newsFactory.build({ status: 'published', published_at: now, created_at: past, metadata: metadata});

      news = new News(news);
      news.save(function(err, newsIdent) {
        if(err) throw err;

        news.metadata.url = '';

        subject()
        .expect(200)
        .end(function(err, _result) {
          if (err) return done(err);

          News.findById(newsIdent, function(err, result) {
            assert.equal(result.metadata.url, '/this-path-should-not-disappear');
            done(err);
          });
        });
      });
    });

  });

  describe('POST /news/<id>/unpublish', function() {
    var news;
    var newsId;

    var subject = function() {
      return api.post(NEWS_RESOURCE + '/' + newsId + '/unpublish').send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    beforeEach(function(done) {
      news = new News(newsFactory.build({status: 'draft'}));
      news.save(function(err) {
        if (err) {
          done(err);
          return;
        }

        newsId = news._id.valueOf();
        publisher.publish([news], done);
      });
    });

    shared.behavesAsAuthenticated(() =>
      api.post(NEWS_RESOURCE + '/' + newsId + '/unpublish')
    );

    it('succeeds', function(done) {
      subject().expect(200).end(done);
    });

    it('has content type json', function(done) {
      subject().expect('Content-Type', /json/).end(done);
    });

    it('sets status to draft', function(done) {
      subject().end(function(err, res) {
        expect(res.body.status).to.equal('draft');

        done(err);
      });
    });
  });

  describe('PUT /news/<id>/publish', function() {
    describe('when entity is of type news', function() {
      var news;
      var newsId;

      beforeEach(function(done) {
        news = newsFactory.build();
        api.post(NEWS_RESOURCE)
          .send(news)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(201)
          .end(function(err, res) {
            if(err){
              done(err);
            } else {
              newsId = res.body.id;
              done();
            }
          });
      });

      var subject = function() {
        return api.post(NEWS_RESOURCE + '/' + newsId + '/publish').send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
      };

      context('when incremental generation is enabled', () => {
        beforeEach(() => {
          process.env.TOGGLE_qVIq5Tnp_INCREMENTAL_GEN = 'enabled';
          sandbox.stub(publisher, 'publishLater').yields(null, news);
        });

        it('succeeds', function(done) {
          subject()
            .expect(202)
            .end(done);
        });
      });

      context('when incremental generation is disabled', () => {
        beforeEach(() => {
          process.env.TOGGLE_qVIq5Tnp_INCREMENTAL_GEN = false;
        });

        shared.behavesAsAuthenticated(() =>
          api.put(NEWS_RESOURCE + '/' + newsId + '/publish')
        );

        it('succeeds', function(done) {
          subject()
            .expect(202)
            .end(done);
        });

        it('returns json', function(done) {
          subject()
            .expect('Content-Type', /json/)
            .end(done);
        });

        it('sets published_at date', function(done) {
          subject()
            .end(function(err, res) {
              expect(new Date(res.body.published_at).getTime()).to.be.equal(Date.now());
              done();
            });
        });

        it('sets status as published', function(done) {
          subject()
            .end(function(err, res) {
              expect(res.body.status).to.be.equal('published');
              done();
            });
        });

        it('sets the path in which the news is available', function(done) {
          subject()
            .end(function(err, res) {
              expect(res.body.metadata.url).to.be.equal(buildNewsHTTPPath(news.metadata.title));
              done();
            });
        });
      });
    });

    describe('when entity is of type photo caption', function() {
      var photoCaption;
      var photoCaptionId;
      beforeEach(function(done) {
        photoCaption = photoCaptionFactory.build();
        api.post(NEWS_RESOURCE)
          .send(photoCaption)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(201)
          .end(function(err, res) {
            if(err) throw err;

            photoCaptionId = res.body.id;
            done();
          });
      });

      var subject = function() {
        return api.post(NEWS_RESOURCE + '/' + photoCaptionId + '/publish').send(photoCaption).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
      };

      it('does not create yaml front matter file', function(done) {
        subject()
          .expect(202)
          .end(function(err, _res) {
            if(err) throw err;

            News.findById(photoCaptionId, function(err, result) {
              if(err) throw err;
              assert.equal(result.status, 'published');
              assert.equal(fs.existsSync(hexoPaths.postsPath + newsYearMonthURL + photoCaptionId + '.md'), true);
              done();
            });
          });
      });
    });

    describe('when entity is of type tabloid', function() {
      var tabloid;
      var tabloidId;
      beforeEach(function(done) {
        tabloid = tabloidFactory.build();
        api.post(NEWS_RESOURCE)
          .send(tabloid)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(201)
          .end(function(err, res) {
            if(err) throw err;

            tabloidId = res.body.id;
            done();
          });
      });

      var subject = function() {
        return api.post(NEWS_RESOURCE + '/' + tabloidId + '/publish').send(tabloid).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
      };

      it('creates tabloid data file', function(done) {
        subject()
          .expect('Content-Type', /json/)
          .expect(202)
          .end(function(err, _res) {
            if (err) done(err);

            News.findById(tabloidId, function(err, result) {
              var published_at = result.published_at;
              assert.ok(published_at);
              assert.equal(Date.now(), published_at.getTime());
              assert.equal(result.status, 'published');
              assert.equal(result.metadata.url, buildNewsHTTPPath(tabloid.metadata.title));

              var tabloidFileAsFrontMatters = fs.readFileSync(hexoPaths.postsPath + newsYearMonthURL + tabloidId + '.md', 'utf-8');
              var tabloidFileAsObj = grayMatter(tabloidFileAsFrontMatters);
              assert.equal(tabloidFileAsObj.data.url, buildNewsHTTPPath(tabloid.metadata.title));

              done();
            });
          });
      });
    });
  });
});

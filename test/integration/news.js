var fs          = require('fs');
var grayMatter  = require('gray-matter');
var slug        = require('slug');
var supertest   = require('supertest');

var newsRepository  = require('../../lib/news/news-repository');
var publisher = require('../../lib/news/publisher');
var server          = require('../../lib/http/server');

var metadataFactory     = require('../factories/news-attribute').metadata;
var newsFactory         = require('../factories/news-attribute').newsAttribute;
var columnFactory       = require('../factories/column-attributes').columnAttributes;
var photoCaptionFactory = require('../factories/photo-caption-attributes').photoCaptionAttributes;
var tabloidFactory      = require('../factories/tabloid-attributes').tabloidAttributes;

var api             = supertest('https://localhost:5000');

describe('REST API:', function() {
  var NEWS_RESOURCE;

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

  var clock;

  var newsCreatedAt;

  before(function(done){
    server.startServer();

    NEWS_RESOURCE = '/news';

    var testDate = new Date('Feb 14, 2016 01:15:00');

    newsYearMonthURL = '/2016/02/';
    newsYearMonthDayURL = '/2016/02/14/';

    clock = sinon.useFakeTimers(testDate.getTime(), 'Date');
    newsCreatedAt = Date.now();

    newsRepository.deleteAll(function(){
      deleteDirSync(hexoPaths.sourcePath);
      done();
    });
  });

  after(function(done) {
    newsRepository.deleteAll(function() {
      deleteDirSync(hexoPaths.sourcePath);
      done();
    });

    clock.restore();
  });

  describe('POST /news', function() {

    var subject = function(news, skipAuthentication) {
      var subject = api.post(NEWS_RESOURCE).send(news);

      if(!skipAuthentication)
        subject = subject.auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);

      return subject;
    };

    it('fails if not authenticated', function(done){
      var news = newsFactory.build();

      subject(news, true)
        .expect(401)
        .end(done);
    });

    it('persists news', function(done) {
      var news = newsFactory.build();

      subject(news)
        .expect(201)
        .end(function(err, res) {
          if(err){ done(err); }

          var newsId = res.body.id;
          assert(typeof newsId !== 'undefined');
          newsRepository.findById(newsId, function(err, result) {
            verifyNewsAttributes(result, news);
            assert.equal(result.status, 'draft');
            assert.ok(result.created_at);
            done();
          });
        });
    });

    it('does not set news path', function(done) {
      var metadata = metadataFactory.build({ url: '/bad-bad-path' });
      var news = newsFactory.build({ metadata: metadata });

      subject(news)
        .expect(201)
        .end(function(err, res) {
          if(err){ done(err); }

          var newsId = res.body.id;
          assert(typeof newsId !== 'undefined');
          newsRepository.findById(newsId, function(err, result) {
            assert.equal(result.metadata.url, undefined);
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

          newsRepository.findById(columnId, function(err, result) {
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

    var subject = function(skipAuthentication) {
      var subject = api.get(NEWS_RESOURCE + '/' + newsId).send();

      if(!skipAuthentication)
        subject = subject.auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);

      return subject;
    };

    it('fails if not authenticated', function(done){
      subject(true)
        .expect(401)
        .end(done);
    });

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

    var subject = function(skipAuthentication) {
      var subject = api.put(NEWS_RESOURCE + '/' + newsId).send(news);

      if(!skipAuthentication)
        subject = subject.auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);

      return subject;
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

    it('fails if not authenticated', function(done){
      subject(true)
        .expect(401)
        .end(done);
    });

    it('updates previously saved news', function(done){
      news.metadata.title = 'Outro Título';
      news.metadata.area = 'direitos_humanos';
      news.metadata.hat = 'Outro Chapéu';
      news.metadata.description = 'Outra Descrição';

      subject()
        .expect(200)
        .end(function(err, res) {
          if(err){ done(err); }

          var id = res.body.id;
          assert(typeof id !== 'undefined');
          assert.equal(id, newsId);

          newsRepository.findById(newsId, function(err, result) {
            verifyNewsAttributes(result, news);
            done();
          });
        });
    });

    it('updates updated_at date', function(done){
      var clock = sinon.useFakeTimers(Date.now(), 'Date');

      subject()
        .expect(200)
        .end(function(err, _res) {
          if(err){ done(err); }

          newsRepository.findById(newsId, function(err, result) {
            assert.equal(result.updated_at.getTime(), Date.now());
            clock.restore();
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

          var id = res.body.id;
          assert(typeof id !== 'undefined');
          assert.equal(id, newsId);

          newsRepository.findById(newsId, function(err, result) {
            assert.equal(result.metadata.url, undefined);
            done();
          });
        });
    });

    it('does not reset news path for published news', function(done) {
      var now = new Date();
      var past = new Date(1000);

      var metadata = metadataFactory.build({ url: '/this-path-should-not-disappear' });
      var news = newsFactory.build({ status: 'published', published_at: now, created_at: past, metadata: metadata});

      newsRepository.insert(news, function(err, newsIdent) {
        if(err) throw err;

        news.metadata.url = '';

        subject()
        .expect(200)
        .end(function(err, _result) {

          newsRepository.findById(newsIdent.valueOf(), function(err, result) {
            assert.equal(result.metadata.url, '/this-path-should-not-disappear');
            done();
          });

        });
      });
    });

  });

  describe('POST /news/<id>/unpublish', function() {
    var news;
    var newsId;

    var subject = function(skipAuthentication) {
      var subject = api.post(NEWS_RESOURCE + '/' + newsId + '/unpublish').send(news);

      if(!skipAuthentication)
        subject = subject.auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);

      return subject;
    };

    beforeEach(function(done) {
      news = newsFactory.build();
      newsRepository.insert(news, function(err, res) {
        if (err) {
          done(err);
          return;
        }

        newsId = res;
        publisher.publish(news, done);
      });
    });

    it('fails if not authenticated', function(done){
      subject(true)
        .expect(401)
        .end(done);
    });

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

  describe('PUT /news/<id>/status/published', function() {

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

      var subject = function(skipAuthentication) {
        var subject = api.put(NEWS_RESOURCE + '/' + newsId + '/status/published').send(news);

        if(!skipAuthentication)
          subject = subject.auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);

        return subject;
      };

      it('fails if not authenticated', function(done){
        subject(true)
          .expect(401)
          .end(done);
      });

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

      var subject = function(skipAuthentication) {
        var subject = api.put(NEWS_RESOURCE + '/' + photoCaptionId + '/status/published').send(photoCaption);

        if(!skipAuthentication)
          subject = subject.auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);

        return subject;
      };

      it('fails if not authenticated', function(done){
        subject(true)
          .expect(401)
          .end(done);
      });

      it('does not create yaml front matter file', function(done) {
        subject()
          .expect(202)
          .end(function(err, _res) {
            if(err) throw err;

            newsRepository.findById(photoCaptionId, function(err, result) {
              if(err) throw err;
              assert.equal(result.status, 'published');
              assert.equal(fs.existsSync(hexoPaths.postsPath + newsYearMonthURL + photoCaptionId + '.md'), false);
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

      var subject = function(skipAuthentication) {
        var subject = api.put(NEWS_RESOURCE + '/' + tabloidId + '/status/published').send(tabloid);

        if(!skipAuthentication)
          subject = subject.auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);

        return subject;
      };

      it('fails if not authenticated', function(done){
        subject(true)
          .expect(401)
          .end(done);
      });

      it('creates tabloid data file', function(done) {

        subject()
          .expect('Content-Type', /json/)
          .expect(202)
          .end(function(err, _res) {
            if (err) done(err);

            newsRepository.findById(tabloidId, function(err, result) {
              var published_at = result.published_at;
              assert.ok(published_at);
              assert.equal(Date.now(), published_at.getTime());
              assert.equal(result.status, 'published');
              assert.equal(result.metadata.url, buildNewsHTTPPath(tabloid.metadata.title));

              assert.ok(fs.existsSync(hexoPaths.sourcePath + '/index.md'));

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

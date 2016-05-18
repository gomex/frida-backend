var _           = require('underscore');
var assert      = require('assert');
var fs          = require('fs');
var grayMatter  = require('gray-matter');
var slug        = require('slug');
var supertest   = require('supertest');

var chai = require('chai');
var expect = require('chai').expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var newsRepository  = require('../../lib/news/news-repository');
var publisher = require('../../lib/news/publisher');
var server          = require('../../lib/http/server');

var metadataFactory     = require('../factories/news-attribute').metadata;
var newsFactory         = require('../factories/news-attribute').newsAttribute;
var columnFactory       = require('../factories/column-attributes').columnAttributes;
var photoCaptionFactory = require('../factories/photo-caption-attributes').photoCaptionAttributes;
var tabloidFactory      = require('../factories/tabloid-attributes').tabloidAttributes;

var api             = supertest('https://localhost:5000');

chai.use(sinonChai);

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

  var buildPublishURL = function(newsId) {
    return NEWS_RESOURCE + '/' + newsId + '/status/published';
  };

  var buildGetNewsByIdURL = function(newsId) {
    return NEWS_RESOURCE + '/' + newsId;
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

    it('persists news', function(done) {
      var news = newsFactory.build();

      api.post(NEWS_RESOURCE)
        .send(news)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

      api.post(NEWS_RESOURCE)
        .send(news)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

      api.post(NEWS_RESOURCE)
        .send(column)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

    it('retrieves previously saved news or column', function(done){
      api.get(buildGetNewsByIdURL(newsId))
        .send()
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

    it('updates previously saved news', function(done){
      var newsAsString;

      news.metadata.title = 'Outro Título';
      news.metadata.area = 'direitos_humanos';
      news.metadata.hat = 'Outro Chapéu';
      news.metadata.description = 'Outra Descrição';

      newsAsString = _.clone(news);

      newsAsString.metadata = JSON.stringify(newsAsString.metadata);

      api.put(buildGetNewsByIdURL(newsId))
        .send(newsAsString)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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
      var newsAsString;

      newsAsString = _.clone(news);

      newsAsString.metadata = JSON.stringify(newsAsString.metadata);

      var clock = sinon.useFakeTimers(Date.now(), 'Date');

      api.put(buildGetNewsByIdURL(newsId))
        .send(newsAsString)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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
      var newsAsString;

      news.metadata.url = '/bad-bad-path';

      newsAsString = _.clone(news);

      newsAsString.metadata = JSON.stringify(newsAsString.metadata);

      api.put(buildGetNewsByIdURL(newsId))
        .send(newsAsString)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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
        var newsAsString = _.clone(news);
        newsAsString.metadata = JSON.stringify(newsAsString.metadata);

        api.put(buildGetNewsByIdURL(newsIdent))
        .send(newsAsString)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

    var subject = function() {
      return api.put(NEWS_RESOURCE + '/' + newsId + '/unpublish')
        .send(news)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
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


      it('creates news data file', function(done) {

        api.put(buildPublishURL(newsId))
          .send(news)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect('Content-Type', /json/)
          .expect(202)
          .end(function(err, res) {
            if (err) {
              done(err);
            }

            assert.deepEqual(res.body, {path : buildNewsHTTPPath(news.metadata.title)});

            newsRepository.findById(newsId, function(err, result) {
              var published_at = result.published_at;
              assert.ok(published_at);
              assert.equal(Date.now(), published_at.getTime());
              assert.equal(result.status, 'published');
              assert.equal(result.metadata.url, buildNewsHTTPPath(news.metadata.title));

              // test index.md file
              assert.ok(fs.existsSync(hexoPaths.sourcePath + '/index.md'));

              // test news.md file
              var newsFileAsFrontMatters = fs.readFileSync(hexoPaths.postsPath + newsYearMonthURL + newsId + '.md', 'utf-8');
              var newsFileAsObj = grayMatter(newsFileAsFrontMatters);
              assert.equal(newsFileAsObj.data.url, buildNewsHTTPPath(news.metadata.title));

              done();
            });
          });
      });

      it('creates area data file', function(done) {
        api.put(buildPublishURL(newsId))
          .send(news)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect('Content-Type', /json/)
          .expect(202)
          .end(function(err, _res) {
            if (err) throw err;

            var areaDataFilePath = hexoPaths.sourcePath + '/' + news.metadata.area + '/index.md';

            assert.ok(fs.existsSync(areaDataFilePath));

            var areaDataFileAsFrontMatters = fs.readFileSync(areaDataFilePath, 'utf-8');
            var areaPageData = grayMatter(areaDataFileAsFrontMatters);
            assert.notEqual(areaPageData.data, null);

            done();
          });
      });


      it('does not change published_at date if it is already set', function(done) {
        var past = new Date(1000);

        var news = newsFactory.build({ published_at: past });

        newsRepository.insert(news, function(err, newsIdent) {
          if(err) throw err;

          api.put(buildPublishURL(newsIdent.valueOf()))
          .expect(202)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .end(function(err, _result) {
            newsRepository.findById(newsIdent.valueOf(), function(err, result) {
              assert.equal(past.valueOf(), result.published_at.valueOf());
              done();
            });
          });
        });
      });

      it('does not change news path if it is already set', function(done) {
        var past = new Date(1000);

        var metadata = metadataFactory.build({url: '/crazy-path'});
        var news = newsFactory.build({ published_at: past, metadata: metadata });

        newsRepository.insert(news, function(err, newsIdent) {
          if(err) throw err;

          api.put(buildPublishURL(newsIdent.valueOf()))
          .expect(202)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .end(function(err, _result) {
            newsRepository.findById(newsIdent.valueOf(), function(err, result) {
              assert.equal(result.metadata.url, '/crazy-path');
              done();
            });
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

      it('does not create yaml front matter file', function(done) {
        api.put(buildPublishURL(photoCaptionId))
          .send(photoCaption)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

      it('creates tabloid data file', function(done) {

        api.put(buildPublishURL(tabloidId))
          .send(tabloid)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect('Content-Type', /json/)
          .expect(202)
          .end(function(err, res) {
            if (err) done(err);

            assert.deepEqual(res.body, {path : buildNewsHTTPPath(tabloid.metadata.title)});

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

var _           = require('underscore');
var assert      = require('assert');
var fs          = require('fs');
var grayMatter  = require('gray-matter');
var slug        = require('slug');
var sinon       = require('sinon');
var supertest   = require('supertest');

var newsRepository  = require('../../lib/news/news-repository');
var NewsUtil        = require('../../lib/news/news-util');
var server          = require('../../lib/http/server');

var newsFactory         = require('../factories/news-attribute').newsAttribute;
var columnFactory       = require('../factories/column-attributes').columnAttributes;
var photoCaptionFactory = require('../factories/photo-caption-attributes').photoCaptionAttributes;

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

  var buildPublishURL = function(newsId) {
    return NEWS_RESOURCE + '/' + newsId + '/status/published';
  };

  var buildDraftURL = function(newsId) {
    return NEWS_RESOURCE + '/' + newsId + '/status/draft';
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
  });

  describe('PUT /news/<id>/status/<status>', function() {

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

      describe('and <status> is "published"', function() {

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

          newsRepository.insert(NewsUtil.prepare(news), function(err, newsIdent) {
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
      });

      describe('and <status> is different from published', function() {
        it('does not create yaml front matter file', function(done) {

          api.put(buildDraftURL(newsId))
            .send(news)
            .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
            .expect(200)
            .end(function(err, _res) {
              if (err) {
                done(err);
              }

              newsRepository.findById(newsId, function(err, result) {
                assert.equal(result.published_at, undefined);
                assert.equal(fs.existsSync(hexoPaths.postsPath + newsYearMonthURL + newsId + '.md'), false);
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
  });
});

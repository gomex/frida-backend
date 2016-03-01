var _           = require('underscore');
var assert      = require('assert');
var fs          = require('fs');
var matters     = require('gray-matter');
var slug        = require('slug');
var sinon       = require('sinon');
var supertest   = require('supertest');

var newsRepository  = require('../../lib/news/news-repository');
var NewsUtil        = require('../../lib/news/news-util');
var server          = require('../../lib/http/server');

var newsTestHelper  = require('../helpers/news');

var api             = supertest('https://localhost:5000');

describe('file: news.js. Test NEWS operations using REST API:', function() {
  var NEWS_RESOURCE;
  var NATIONAL;

  var testDate;
  var newsYearMonthURL;
  var newsYearMonthDayURL;
  var newsPublishDir;

  var hexoPaths = {
    sourcePath: process.env.HEXO_SOURCE_PATH + '/',
    postsPath: [process.env.HEXO_SOURCE_PATH, '_posts'].join('/')
  };

  // helper functions
  var deleteDirSync = function(path, done) {
    if(fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, _index) {
        var curPath = path + '/' + file;
        fs.unlinkSync(curPath);
      });
      fs.rmdir(path, function(err) {
        done(err);
      });
    } else {
      done();
    }
  };

  var testColumnistNewsCommonAttributes = function (calculatedObject, expectedObject) {
    assert.equal(typeof calculatedObject._id !== 'undefined', true);
    assert.equal(calculatedObject.body, expectedObject.body);
    assert.equal(calculatedObject.created_at.getTime(), newsCreatedAt);
    assert.equal(calculatedObject.metadata.description, expectedObject.metadata.description);
    assert.equal(calculatedObject.metadata.hat, expectedObject.metadata.hat);
    assert.equal(calculatedObject.metadata.layout, expectedObject.metadata.layout);
    assert.equal(calculatedObject.metadata.title, expectedObject.metadata.title);
  };

  var testNewsAttributes = function(calculatedObject, expectedObject){
    testColumnistNewsCommonAttributes(calculatedObject, expectedObject);
    assert.equal(calculatedObject.metadata.area, expectedObject.metadata.area);
    assert.equal(calculatedObject.metadata.author, expectedObject.metadata.author);
    assert.equal(calculatedObject.metadata.edition, expectedObject.metadata.edition);
    assert.equal(calculatedObject.metadata.place, expectedObject.metadata.place);
  };

  var testColumnistAttributes = function(calculatedObject, expectedObject) {
    testColumnistNewsCommonAttributes(calculatedObject, expectedObject);
    assert.equal(calculatedObject.metadata.columnist, expectedObject.metadata.columnist);
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
    NATIONAL = '[not-a-link]';

    testDate = new Date('Feb 14, 2016 01:15:00');

    newsYearMonthURL = '/2016/02/';
    newsYearMonthDayURL = '2016/02/14/';
    newsPublishDir = hexoPaths.postsPath + newsYearMonthURL;

    clock = sinon.useFakeTimers(testDate.getTime(), 'Date');
    newsCreatedAt = Date.now();

    newsRepository.deleteAll(function(){
      deleteDirSync(newsPublishDir, done);
    });
  });

  after(function(done) {
    newsRepository.deleteAll(function() {
      console.log('file: news.js - end of tests. All entries removed.');
      deleteDirSync(newsPublishDir, done);
    });

    clock.restore();
  });

  describe('insert NEWS and OPINIONS using rest service: /news, method: POST', function() {

    it('insert NEWS - url: /news, method: POST', function(done) {
      var newsDataTest = newsTestHelper.createNews(NATIONAL);

      var callback = function(err, res) {
        if(err){ done(err); }

        var newsId = res.body.id;
        assert(typeof newsId !== 'undefined');
        newsRepository.findById(newsId, function(result) {
          testNewsAttributes(result, newsDataTest);
          assert.equal(result.status, 'draft');
          done();
        });
      };

      api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callback);
    });

    it('insert OPINION - url: /news, method: POST', function(done) {
      var opinionTestData = newsTestHelper.createOpinion();

      var callback = function(err, res) {
        if(err){ done(err); }

        var opinionId = res.body.id;
        assert(typeof opinionId !== 'undefined');

        newsRepository.findById(opinionId, function(result) {
          testColumnistAttributes(result, opinionTestData);
          assert.equal(result.status, 'draft');
          done();
        });
      };

      api.post(NEWS_RESOURCE)
        .send(opinionTestData)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callback);
    });
  });

  describe('test backend created attributes for NEWS/OPINIONS', function(){

    it('When news is inserted and not published', function(done) {
      var newsDataTest = newsTestHelper.createNews(NATIONAL);

      var callback = function(err, res){
        if(err){ done(err); }

        var newsId = res.body.id;
        assert(typeof newsId !== 'undefined');

        newsRepository.findById(newsId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.metadata.url, buildNewsHTTPPath(newsDataTest.metadata.title));
          done();
        });
      };

      api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callback);
    });

    it('When opinion is inserted and not published', function(done){
      var opinionDataTest = newsTestHelper.createOpinion();

      var callback = function(err, res){
        if(err){ done(err); }

        var opinionId = res.body.id;
        assert(typeof opinionId !== 'undefined');

        newsRepository.findById(opinionId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.metadata.url, newsYearMonthDayURL + slug(opinionDataTest.metadata.title, {lower: true}) + '/');
          done();
        });
      };

      api.post(NEWS_RESOURCE)
        .send(opinionDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callback);
    });

  });

  describe('get NEWS and OPINIONS using rest service /news/:id, method: GET', function(){

    it('insert and get NEWS through REST using NEWS id', function(done){
      var newsDataTest = newsTestHelper.createNews(NATIONAL);
      var newsId;

      var callbackPost = function(err, res){
        if(err){ done(err); }

        newsId = res.body.id;
        assert(typeof newsId !== 'undefined');

        newsRepository.findById(newsId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
        });

        //TODO(geisly) usar async waterfall
        api.get(buildGetNewsByIdURL(newsId))
          .send()
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(200)
          .end(callbackGet);
      };

      var callbackGet = function(err, res){
        if(err){ done(err); }
        var newsReturnedFromGet = res.body;
        assert.equal(newsReturnedFromGet._id, newsId);
        assert.equal(newsReturnedFromGet.metadata.area, newsDataTest.metadata.area);
        assert.equal(newsReturnedFromGet.metadata.author, newsDataTest.metadata.author);
        assert.equal(newsReturnedFromGet.metadata.description, newsDataTest.metadata.description);
        assert.equal(newsReturnedFromGet.metadata.edition, newsDataTest.metadata.edition);
        assert.equal(newsReturnedFromGet.metadata.hat, newsDataTest.metadata.hat);
        assert.equal(newsReturnedFromGet.metadata.layout, newsDataTest.metadata.layout);
        assert.equal(newsReturnedFromGet.metadata.place, newsDataTest.metadata.place);
        assert.equal(newsReturnedFromGet.metadata.title, newsDataTest.metadata.title);
        done();
      };

      api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callbackPost);
    });
  });

  describe('update NEWS and OPINIONS using rest service: /news/:id, method: PUT', function(){

    it('insert and update NEWS through REST using NEWS id', function(done){
      var newsDataTest = newsTestHelper.createNews(NATIONAL);
      var newsDataTestStringifyed;
      var newsId;

      var callbackPost = function(err, res) {
        if (err) {
          done(err);
        }

        newsId = res.body.id;
        assert(typeof newsId !== 'undefined');

        newsRepository.findById(newsId, function (result) {
          assert.equal(typeof result._id !== 'undefined', true);
        });

        newsDataTest.metadata.title = 'Outro Título';
        newsDataTest.metadata.area = 'direitos_humanos';
        newsDataTest.metadata.hat = 'Outro Chapéu';
        newsDataTest.metadata.description = 'Outra Descrição';

        newsDataTestStringifyed = _.clone(newsDataTest);

        newsDataTestStringifyed.metadata = JSON.stringify(newsDataTestStringifyed.metadata);

        api.put(buildGetNewsByIdURL(newsId))
          .send(newsDataTestStringifyed)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(200)
          .end(callbackPut);
      };

      var callbackPut = function(err, res){
        if(err){ done(err); }

        var id = res.body.id;
        assert(typeof id !== 'undefined');
        assert.equal(id, newsId);

        newsRepository.findById(newsId, function(result) {
          testNewsAttributes(result, newsDataTest);
          done();
        });
      };

      api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callbackPost);
    });
  });

  describe('publish NEWS and OPINIONS using rest service: /news', function(done){

    var testIndexFile = function(filePath, layout, newsTitle) {
      fs.readFile(filePath, 'utf-8', function(err, indexFileAsFrontMatters){
        if(err){done(err);}

        assert.ok(indexFileAsFrontMatters);
        var indexFileAsObj = matters(indexFileAsFrontMatters);

        assert.equal(indexFileAsObj.data.layout, layout);
        assert.equal(indexFileAsObj.data.featured[0].path, buildNewsHTTPPath(newsTitle));
      });
    };

    it('publish national NEWS already saved - using status: published', function(done){
      var newsDataTest = newsTestHelper.createNews(NATIONAL);
      var newsId;

      var callbackPost = function(err, res) {
        if (err) {
          done(err);
        }

        newsId = res.body.id;
        assert(typeof newsId !== 'undefined');

        newsRepository.findById(newsId, function (result) {
          assert.equal(typeof result._id !== 'undefined', true);
        });

        api.put(buildPublishURL(newsId))
          .send(newsDataTest)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect('Content-Type', /json/)
          .expect(202)
          .end(callbackPut);

      };

      var callbackPut = function(err, res) {
        if (err) {
          done(err);
        }

        assert.equal(JSON.stringify(res.body), JSON.stringify({path : '2016/02/' + slug(newsDataTest.metadata.title) + '/'}));

        newsRepository.findById(newsId, function(result) {
          var published_at = result.published_at;
          assert.ok(published_at);
          assert.equal(Date.now(), published_at.getTime());
          assert.equal(result.status, 'published');
          assert.equal(result.metadata.url, buildNewsHTTPPath(newsDataTest.metadata.title));

          // test index.md file
          testIndexFile(hexoPaths.sourcePath + '/index.md', 'nacional', newsDataTest.metadata.title);

          // test news.md file
          fs.readFile(hexoPaths.postsPath + newsYearMonthURL + newsId + '.md', 'utf-8', function(err, newsFileAsFrontMatters){
            var newsFileAsObj = matters(newsFileAsFrontMatters);
            assert.equal(newsFileAsObj.data.edition, NATIONAL);
            assert.equal(newsFileAsObj.data.url, buildNewsHTTPPath(newsDataTest.metadata.title));
            done();
          });
        });
      };

      api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callbackPost);

    });

    it('publish tabloide NEWS already saved - using status: published', function(done){
      var newsDataTest = newsTestHelper.createNews('minas-gerais');
      var newsId;

      var callbackPost = function(err, res) {
        if (err) {
          done(err);
        }

        newsId = res.body.id;
        assert(typeof newsId !== 'undefined');

        newsRepository.findById(newsId, function (result) {
          assert.equal(typeof result._id !== 'undefined', true);
        });

        clock.tick(100000);
        api.put(buildPublishURL(newsId))
          .send(newsDataTest)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect('Content-Type', /json/)
          .expect(202)
          .end(callbackPut);
      };

      var callbackPut = function(err, res) {
        if (err) {
          done(err);
        }

        assert.equal(JSON.stringify(res.body), JSON.stringify({path : '2016/02/' + slug(newsDataTest.metadata.title) + '/'}));

        newsRepository.findById(newsId, function(result) {
          var published_at = result.published_at;
          assert.ok(published_at);
          assert.equal(Date.now(), published_at.getTime());
          assert.equal(result.status, 'published');
          assert.equal(result.metadata.url, buildNewsHTTPPath(newsDataTest.metadata.title));

          // test index.md file
          testIndexFile(hexoPaths.sourcePath + '/minas-gerais/index.md', 'tabloide', newsDataTest.metadata.title);

          // test news.md file
          fs.readFile(hexoPaths.postsPath + newsYearMonthURL + newsId + '.md', 'utf-8', function(err, newsFileAsFrontMatters){
            var newsFileAsObj = matters(newsFileAsFrontMatters);
            assert.equal(newsFileAsObj.data.edition, 'minas-gerais');
            assert.equal(newsFileAsObj.data.url, 'minas-gerais/' + newsYearMonthDayURL + slug(newsDataTest.metadata.title, {lower: true}) + '/');
            done();
          });
        });
      };

      api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callbackPost);
    });

    it('does not create yaml front matter file on status update if status is different from published', function(done) {
      var newsDataTest = newsTestHelper.createNews(NATIONAL);
      var newsId;

      var callbackPost = function(err, res) {
        if (err) {
          done(err);
        }

        newsId = res.body.id;

        api.put(buildDraftURL(newsId))
          .send(newsDataTest)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(200)
          .end(callbackPut);
      };

      var callbackPut = function(err, _res) {
        if (err) {
          done(err);
        }

        newsRepository.findById(newsId, function(result) {
          assert.equal(result.published_at, undefined);
          assert.equal(fs.existsSync(hexoPaths.postsPath + newsYearMonthURL + newsId + '.md'), false);
          done();
        });
      };

      api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callbackPost);
    });

    it('published_at date should not change if it is already set', function(done) {
      var past = new Date(1000);

      var news =  {
        body: '',
        metadata: {
          title: 'titulo-sensacionalista' + new Date().getTime(),
          edition: NATIONAL // [not-a-link]
        },
        published_at: past
      };

      newsRepository.insert(NewsUtil.prepare(news), function(newsIdent) {
        api.put(buildPublishURL(newsIdent.valueOf()))
        .expect(202)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .end(function(err, _result) {
          newsRepository.findById(newsIdent.valueOf(), function(result) {
            assert.equal(past.valueOf(), result.published_at.valueOf());
            done();
          });
        });
      });
    });
  });
});

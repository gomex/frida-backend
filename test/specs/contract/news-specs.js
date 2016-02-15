var assert = require('assert');
var CONFIG = require('../helpers/config');
var newsRepository = require(CONFIG.ROOT_DIRECTORY + '/lib/news/news-repository');
var NewsUtil = require(CONFIG.ROOT_DIRECTORY + '/lib/news/news-util');
var supertest = require('supertest');
var api = supertest('https://localhost:5000');
var moment = require('moment');
var mongoose        = require('mongoose');
var newsTestHelper = require('../lib/news/news-test-helper');
var slug    = require('slug');
var _       = require('underscore');
var async = require('async');
var fs =  require('fs');
var matters =  require('gray-matter');


describe('file: news-specs.js. Test NEWS operations using REST API:', function() {
  var NEWS_RESOURCE;
  var testDate = new Date("Sun Feb 14 2016 22:00:00 GMT-0200(BRST)");
  var idsToDelete;

  var hexoPaths = {
    posts: [process.env.HEXO_SOURCE_PATH, '_posts'].join('/')
  };

  var deleteDirSync = function(path, done) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function (file, index) {
        var curPath = path + "/" + file;
        fs.unlinkSync(curPath);
      });
      fs.rmdir(path, function(err) {
        done(err);
      });
    } else {
      done();
    }
  };

  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/http/server').startServer();
    NEWS_RESOURCE = '/news';

    newsRepository.deleteAll(function(){
      deleteDirSync(process.env.HEXO_SOURCE_PATH + '/_posts/2016/02/', done);
    });
  });

  afterEach(function(done){
    if(idsToDelete) {
      newsRepository.deleteInIds(idsToDelete, function(err){
        if(err){done(err);}
        idsToDelete = undefined;
        done();
      });
    }
    done();
  });

  after(function(done) {
    newsRepository.deleteAll(function() {
      console.log("file: news-specs.js - end of tests. All entries removed.");
      deleteDirSync(process.env.HEXO_SOURCE_PATH + '/_posts/2016/02/', done);
    });
  });

  describe('insert NEWS and OPINIONS using rest service: /news, method: POST', function() {

    it('insert NEWS - url: /news, method: POST', function(done) {
      var newsDataTest = newsTestHelper.createNews(testDate, '[not-a-link]');

      var callback = function(err, res) {
        if(err){ done(err); }
        var newsId = res.body.id;
        assert(typeof newsId !== 'undefined');
        newsRepository.findById(newsId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.body, newsDataTest.body);
          assert.equal(result.metadata.area, newsDataTest.metadata.area);
          assert.equal(result.metadata.author, newsDataTest.metadata.author);
          assert.equal(result.metadata.created_date.getTime(), newsDataTest.metadata.created_date.getTime());
          assert.equal(result.metadata.date.getTime(), newsDataTest.metadata.date.getTime());
          assert.equal(result.metadata.description, newsDataTest.metadata.description);
          assert.equal(result.metadata.edition, newsDataTest.metadata.edition);
          assert.equal(result.metadata.hat, newsDataTest.metadata.hat);
          assert.equal(result.metadata.layout, newsDataTest.metadata.layout);
          assert.equal(result.metadata.place, newsDataTest.metadata.place);
          assert.equal(result.metadata.title, newsDataTest.metadata.title);
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
      var opinionTestData = newsTestHelper.createOpinion(testDate);

      var callback = function(err, res) {
        if(err){ done(err); }

        var opinionId = res.body.id;
        assert(typeof opinionId !== 'undefined');
        newsRepository.findById(opinionId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.body, opinionTestData.body);
          assert.equal(result.metadata.columnist, opinionTestData.metadata.columnist);
          assert.equal(result.metadata.created_date.getTime(), opinionTestData.metadata.created_date.getTime());
          assert.equal(result.metadata.date.getTime(), opinionTestData.metadata.date.getTime());
          assert.equal(result.metadata.description, opinionTestData.metadata.description);
          assert.equal(result.metadata.hat, opinionTestData.metadata.hat);
          assert.equal(result.metadata.layout, opinionTestData.metadata.layout);
          assert.equal(result.metadata.title, opinionTestData.metadata.title);
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
      var newsDataTest = newsTestHelper.createNews(testDate, '[not-a-link]');

      var callback = function(err, res){
        if(err){ done(err); }

        var newsId = res.body.id;
        assert(typeof newsId !== 'undefined');
        newsRepository.findById(newsId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.metadata.url, '2016/02/14/' + slug(newsDataTest.metadata.title, {lower: true}) + '/');
          assert.ok(result.insertDate);
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
      var opinionDataTest = newsTestHelper.createOpinion(testDate);

      var callback = function(err, res){
        if(err){ done(err); }

        var opinionId = res.body.id;
        assert(typeof opinionId !== 'undefined');
        newsRepository.findById(opinionId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.metadata.url, '2016/02/14/' + slug(opinionDataTest.metadata.title, {lower: true}) + '/');
          assert.ok(result.insertDate);
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
      var newsDataTest = newsTestHelper.createNews(testDate, '[not-a-link]');
      var newsId;

      var callbackPost = function(err, res){
        if(err){ done(err); }

        newsId = res.body.id;
        assert(typeof newsId !== 'undefined');
        newsRepository.findById(newsId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
        });

        //TODO(geisly) usar async waterfall
        api.get(NEWS_RESOURCE + '/' + newsId)
          .send()
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(200)
          .end(callbackGet);
      };

      var callbackGet = function(err, res){
        if(err){ done(err); }
        var body = res.body;
        assert.equal(body._id, newsId);
        assert.equal(body.metadata.area, newsDataTest.metadata.area);
        assert.equal(body.metadata.author, newsDataTest.metadata.author);
        assert.equal(new Date(body.metadata.created_date).getTime(), newsDataTest.metadata.created_date.getTime());
        assert.equal(new Date(body.metadata.date).getTime(), newsDataTest.metadata.date.getTime());
        assert.equal(body.metadata.description, newsDataTest.metadata.description);
        assert.equal(body.metadata.edition, newsDataTest.metadata.edition);
        assert.equal(body.metadata.hat, newsDataTest.metadata.hat);
        assert.equal(body.metadata.layout, newsDataTest.metadata.layout);
        assert.equal(body.metadata.place, newsDataTest.metadata.place);
        assert.equal(body.metadata.title, newsDataTest.metadata.title);
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
      var newsDataTest = newsTestHelper.createNews(testDate, '[not-a-link]');
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

        api.put(NEWS_RESOURCE + '/' + newsId)
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
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result._id, newsId);
          assert.equal(result.body, newsDataTest.body);
          assert.equal(result.metadata.area, newsDataTest.metadata.area);
          assert.equal(result.metadata.author, newsDataTest.metadata.author);
          assert.equal(result.metadata.created_date.getTime(), newsDataTest.metadata.created_date.getTime());
          assert.equal(result.metadata.date.getTime(), newsDataTest.metadata.date.getTime());
          assert.equal(result.metadata.description, newsDataTest.metadata.description);
          assert.equal(result.metadata.edition, newsDataTest.metadata.edition);
          assert.equal(result.metadata.hat, newsDataTest.metadata.hat);
          assert.equal(result.metadata.layout, newsDataTest.metadata.layout);
          assert.equal(result.metadata.place, newsDataTest.metadata.place);
          assert.equal(result.metadata.title, newsDataTest.metadata.title);
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

  describe('publish NEWS and OPINIONS using rest service: /news', function(){

    it('publish national NEWS already saved - using status: published', function(done){
      var newsDataTest = newsTestHelper.createNews(testDate, '[not-a-link]');
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

        api.put(NEWS_RESOURCE + '/' + newsId + '/status/' + 'published')
          .send(newsDataTest)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect('Content-Type', /json/)
          .expect(202)
          .end(callbackPut);

      };

      var callbackPut = function(err, res) {
        var publishedAt = new Date();
        if (err) {
          done(err);
        }
        assert.equal(JSON.stringify(res.body), JSON.stringify({path : '2016/02/' + slug(newsDataTest.metadata.title) + '/'}));
        newsRepository.findById(newsId, function(result) {
          var published_at = result.published_at;
          assert.ok(published_at);
          assert.ok(published_at > testDate && published_at < new Date());
          assert.equal(result.status, 'published');
          assert.equal(result.metadata.url, '2016/02/14/' + slug(newsDataTest.metadata.title, {lower: true}) + '/');

          // test index.md file
          fs.readFile(process.env.HEXO_SOURCE_PATH + '/index.md', 'utf-8', function(err, indexFileAsFrontMatters){
            if(err){done(err);}
            assert.ok(indexFileAsFrontMatters);
            var indexFileAsObj = matters(indexFileAsFrontMatters);
            assert.equal(indexFileAsObj.data.layout, 'nacional');
            assert.equal(indexFileAsObj.data.featured[0].path, '2016/02/14/' + slug(newsDataTest.metadata.title, {lower: true}) + '/');
          });

          // test news.md file
          fs.readFile(process.env.HEXO_SOURCE_PATH + '/_posts/2016/02/' + newsId + '.md', 'utf-8', function(err, newsFileAsFrontMatters){
            var newsFileAsObj = matters(newsFileAsFrontMatters);
            assert.equal(newsFileAsObj.data.edition, '[not-a-link]');
            assert.equal(newsFileAsObj.data.url, '2016/02/14/' + slug(newsDataTest.metadata.title, {lower: true}) + '/');
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
      var newsDataTest = newsTestHelper.createNews(testDate, 'minas-gerais');
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

        api.put(NEWS_RESOURCE + '/' + newsId + '/status/' + 'published')
          .send(newsDataTest)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect('Content-Type', /json/)
          .expect(202)
          .end(callbackPut);
      };

      var callbackPut = function(err, res) {
        var publishedAt = new Date();
        if (err) {
          done(err);
        }
        assert.equal(JSON.stringify(res.body), JSON.stringify({path : '2016/02/' + slug(newsDataTest.metadata.title) + '/'}));
        newsRepository.findById(newsId, function(result) {
          var published_at = result.published_at;
          assert.ok(published_at);
          assert.ok(published_at > testDate && published_at < new Date());
          assert.equal(result.status, 'published');
          assert.equal(result.metadata.url, '2016/02/14/' + slug(newsDataTest.metadata.title, {lower: true}) + '/');

          // test index.md file
          fs.readFile(process.env.HEXO_SOURCE_PATH + '/minas-gerais/index.md', 'utf-8', function(err, indexFileAsFrontMatters){
            if(err){done(err);}
            assert.ok(indexFileAsFrontMatters);
            var indexFileAsObj = matters(indexFileAsFrontMatters);
            assert.equal(indexFileAsObj.data.layout, 'tabloide');
            assert.equal(indexFileAsObj.data.featured[0].path, '2016/02/14/' + slug(newsDataTest.metadata.title, {lower: true}) + '/');
          });

          // test news.md file
          fs.readFile(process.env.HEXO_SOURCE_PATH + '/_posts/2016/02/' + newsId + '.md', 'utf-8', function(err, newsFileAsFrontMatters){
            var newsFileAsObj = matters(newsFileAsFrontMatters);
            assert.equal(newsFileAsObj.data.edition, 'minas-gerais');
            assert.equal(newsFileAsObj.data.url, 'minas-gerais/2016/02/14/' + slug(newsDataTest.metadata.title, {lower: true}) + '/');
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

    it('published_at date should not change if it is already set', function(done) {
      var past = new Date(1000);

      var news =  {
        body: '',
        metadata: {
          title: 'titulo-sensacionalista' + new Date().getTime(),
          edition: '[not-a-link]' // nacional
        },
        published_at: past
      };

      newsRepository.insert(NewsUtil.prepare(news), function(newsIdent) {
        api.put(NEWS_RESOURCE + '/' + newsIdent + '/status/published')
        .expect(202)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .end(function(err, result) {
          newsRepository.findById(newsIdent, function(result) {
            assert.equal(past.valueOf(), result.published_at.valueOf());
            done();
          });
        });
      });
    });
  })
});

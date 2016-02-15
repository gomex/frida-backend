var assert = require('assert');
var CONFIG = require('../helpers/config');
var newsRepository = require(CONFIG.ROOT_DIRECTORY + '/lib/news/news-repository');
//var NewsUtil = require(CONFIG.ROOT_DIRECTORY + '/lib/news/news-util');
var supertest = require('supertest');
var api = supertest('https://localhost:5000');
var moment = require('moment');
var mongoose        = require('mongoose');
var newsTestHelper = require('../lib/news/news-test-helper');
var slug    = require('slug');
var _       = require('underscore');
var async = require('async');


describe('file: news-specs.js. Test NEWS operations using REST API:', function() {
  var NEWS_RESOURCE;
  var testDate = new Date("Sun Feb 14 2016 22:00:00 GMT-0200(BRST)");
  var idsToDelete;

  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/http/server').startServer();
    NEWS_RESOURCE = '/news';
    mongoose.connect(process.env.DATABASE_URL);

    mongoose.connection.once('open', function() {
      newsRepository.deleteAll(function () {
        done();
      });
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
      done();
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
        });
        done();
      };

        api.post(NEWS_RESOURCE)
        .send(newsDataTest)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end(callbackPost);

    });

    it('publish tabloide NEWS already saved - using status: published', function(done){
      done();
    });

    //it('published_at date should not change if it is already set', function(done) {
    //  var past = new Date(1000);
    //
    //  var news =  {
    //    body: '',
    //    metadata: {
    //      title: 'titulo-sensacionalista' + new Date().getTime(),
    //      edition: '[not-a-link]' // nacional
    //    },
    //    published_at: past
    //  };
    //
    //  newsRepository.insert(NewsUtil.prepare(news), function(newsIdent) {
    //    api.put(NEWS_RESOURCE + '/' + newsIdent + '/status/published')
    //    .expect(202)
    //    .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
    //    .end(function(err, result) {
    //      newsRepository.findById(newsIdent, function(result) {
    //        assert.equal(past.valueOf(), result.published_at.valueOf());
    //        done();
    //      });
    //    });
    //  });
    //});
  })
});
//  describe('insert news using POST contract', function() {
//
//
//
//  describe('on status update', function(){
//    var newsIdent, month, year;
//    beforeEach(function(done) {
//      rawData =  {
//        body: '',
//        metadata: {
//          title: 'titulo-sensacionalista' + new Date().getTime(),
//          edition: '[not-a-link]' // nacional
//        }
//      };
//      month = moment().format('MM');
//      year  = moment().format('YYYY');
//
//      newsRepository.insert(NewsUtil.prepare(rawData), function(result) {
//        newsIdent = result;
//
//        done();
//      });
//    });
//
//    it('PUT: /news/<id>/status/<draft>', function(done) {
//      var expectedPath = '';
//
//      api.put(NEWS_RESOURCE + '/' + newsIdent + '/status/draft')
//      .expect(202)
//      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
//      .end(function(err, result) {
//        assert.equal(expectedPath, result.body.path);
//        newsRepository.findById(newsIdent, function(result) {
//          assert.equal('draft', result.status);
//          done();
//        });
//      });
//    });
//
//    it('PUT: /news/<id>/status/<published>', function(done) {
//      var expectedPath = [year, month, rawData.metadata.title].join('/') + '/';
//
//      api.put(NEWS_RESOURCE + '/' + newsIdent + '/status/published')
//      .expect(202)
//      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
//      .end(function(err, result) {
//        assert.equal(expectedPath, result.body.path);
//        newsRepository.findById(newsIdent, function(result) {
//          assert.equal('published', result.status);
//          done();
//        });
//      });
//    });
//
//    it('published_at date should not change if it is already set', function(done) {
//      var past = new Date(1000);
//
//      var news =  {
//        body: '',
//        metadata: {
//          title: 'titulo-sensacionalista' + new Date().getTime(),
//          edition: '[not-a-link]' // nacional
//        },
//        published_at: past
//      };
//
//      newsRepository.insert(NewsUtil.prepare(news), function(newsIdent) {
//        api.put(NEWS_RESOURCE + '/' + newsIdent + '/status/published')
//        .expect(202)
//        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
//        .end(function(err, result) {
//          newsRepository.findById(newsIdent, function(result) {
//            assert.equal(past.valueOf(), result.published_at.valueOf());
//            done();
//          });
//        });
//      });
//    });
//  });
//});

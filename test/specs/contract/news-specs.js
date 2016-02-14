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
  var today = new Date();
  var todayAsMoment = moment(today);
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
        if(err){console.log(err);}
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
      var newsDataTest = newsTestHelper.createNews(today, '[not-a-link]');

      var callback = function(err, res) {
        if(err){ console.log(err); }
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
      var opinionTestData = newsTestHelper.createOpinion(today);

      var callback = function(err, res) {
        if(err){ console.log(err); }

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

    // construct expected URL to be found on database
    function createURL(title){
      var  titleSlug = slug(title, {lower: true});
      var  year = todayAsMoment.format('YYYY');
      var  month = todayAsMoment.format('MM');
      var  day  = todayAsMoment.format('DD');

      return _.compact([year, month, day, titleSlug]).join('/') + '/';
    };

    it('When news is inserted and not published', function(done) {
      var newsDataTest = newsTestHelper.createNews(today, '[not-a-link]');

      var callback = function(err, res){
        if(err){ console.log(err); }

        var newsId = res.body.id;
        assert(typeof newsId !== 'undefined');
        newsRepository.findById(newsId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.metadata.url, createURL(newsDataTest.metadata.title));
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
      var opinionDataTest = newsTestHelper.createOpinion(today);

      var callback = function(err, res){
        if(err){ console.log(err); }

        var opinionId = res.body.id;
        assert(typeof opinionId !== 'undefined');
        newsRepository.findById(opinionId, function(result) {
          assert.equal(typeof result._id !== 'undefined', true);
          assert.equal(result.metadata.url, createURL(opinionDataTest.metadata.title));
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
      var newsDataTest = newsTestHelper.createNews(today, '[not-a-link]');
      var newsId;

      var callbackPost = function(err, res){
        if(err){ console.log(err); }

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
        if(err){ console.log(err); }
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
      var newsDataTest = newsTestHelper.createNews(today, '[not-a-link]');
      var newsDataTestStringifyed;
      var newsId;

      var callbackPost = function(err, res) {
        if (err) {
          console.log(err);
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
        if(err){ console.log(err); }

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
    //it('publish NEWS already saved', function(done){
    //
    //});
    //
    //it('publish NEWS before saving it', function(done){
    //
    //});
  })
});
//  describe('insert news using POST contract', function() {
//
//  it('GET: /news?:filters', function(done){
//
//    api.get(NEWS_RESOURCE + '?year=' + CONFIG.YEAR + '&month=' + CONFIG.MONTH)
//      .expect(200)
//      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
//      .expect('Content-Type', /json/)
//      .end(function(err, res) {
//
//        if (err) {
//          return done(err);
//        }
//
//        assert(res.body instanceof Array);
//
//        res.body.forEach(function (response) {
//          assert.equal(typeof response._id !== 'undefined', true);
//          assert.equal(typeof response.insertDate !== 'undefined', true);
//          assert.equal(typeof response.metadata !== 'undefined', true);
//          assert.equal(typeof response.body !== 'undefined', true);
//        });
//
//        done();
//      });
//  });
//
//  it('GET: /news', function(done){
//
//    api.get(NEWS_RESOURCE)
//      .expect(200)
//      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
//      .expect('Content-Type', /json/)
//      .end(function(err, res) {
//
//        if (err) {
//          return done(err);
//        }
//
//        assert(res.body instanceof Array);
//
//        res.body.forEach(function (response) {
//          assert.equal(typeof response._id !== 'undefined', true);
//          assert.equal(typeof response.insertDate !== 'undefined', true);
//          assert.equal(typeof response.metadata !== 'undefined', true);
//          assert.equal(typeof response.body !== 'undefined', true);
//        });
//
//        done();
//      });
//  });
//
//  it('PUT: /news/<id>', function(done) {
//    rawData.test = 'test';
//
//    var title = 'titulo-sensacionalista' + new Date().getTime();
//    rawData.metadata = JSON.stringify({title: title});
//
//    api.put(NEWS_RESOURCE + '/' + newsId)
//      .send(rawData)
//      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
//      .expect(204)
//      .end(function(err) {
//
//        newsRepository.findById(newsId, function(result) {
//
//          assert.equal(typeof result._id !== 'undefined', true);
//          assert.equal(typeof result.metadata === 'object', true);
//          assert.equal(result.metadata.title === title, true);
//          done();
//        });
//      });
//  });
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

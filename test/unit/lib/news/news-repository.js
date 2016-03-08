'use strict';

var _               = require('underscore');
var assert          = require('assert');
var async           = require('async');

var newsRepository  = require('../../../../lib/news/news-repository');

var metadataFactory = require('../../../factories/news-attribute').metadata;
var newsFactory     = require('../../../factories/news-attribute').newsAttribute;

describe('news-repository', function(){

  beforeEach(function(done){
    newsRepository.deleteAll(done);
  });

  describe('insert', function(){

    it('passes the id assigned to the persisted news to its callback', function(done) {
      var news = newsFactory.build();

      newsRepository.insert(news, function(err, id) {
        assert.equal(err, null);
        assert.equal(typeof id, 'string');
        done();
      });
    });

  });

  describe('findById', function(){

    it('retrieves a previously saved news given its id', function(done) {
      var metadata = metadataFactory.build({title: 'title-' + Date.now() });
      var news = newsFactory.build({metadata: metadata});

      newsRepository.insert(news, function(err, id) {
        newsRepository.findById(id, function(err, news){
          assert.equal(err, null);
          assert.equal(news.metadata.title, metadata.title);
          done();
        });
      });
    });

  });

  describe('getAll', function(){

    it('retrieves all previously saved news', function(done) {
      var news1 = newsFactory.build();
      var news2 = newsFactory.build();

      async.parallel([
        async.apply(newsRepository.insert, news1),
        async.apply(newsRepository.insert, news2)
      ], function(err, insertedIds){
        newsRepository.getAll(function(err, result){
          assert.equal(err, null);
          assert.equal(result.length, 2);
          var retrievedIds = _.map(result, function(item) { return item._id.toString(); });
          assert.ok(_.isEqual(retrievedIds.sort(), insertedIds.sort()));
          done();
        });
      });
    });

  });
});

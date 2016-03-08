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

  describe('updateById', function(){
    it('updates the fields of the news with the given id', function(done){
      var news = newsFactory.build();

      newsRepository.insert(news, function(err, id) {
        if(err) throw err;
        var updatedFields = _.clone(news);
        updatedFields.metadata.title = 'brand new title' + Date.now();

        newsRepository.updateById(id, updatedFields, function(err){
          if(err) throw err;

          newsRepository.findById(id, function(err, item) {
            if(err) throw err;
            assert.equal(item.metadata.title, updatedFields.metadata.title);
            assert.equal(item.metadata.description, news.metadata.description);
            done();
          });
        });

      });
    });
  });

  describe('deleteAll', function(){
    it('deletes all persisted news', function(done){
      var news1 = newsFactory.build();
      var news2 = newsFactory.build();

      async.parallel([
        async.apply(newsRepository.insert, news1),
        async.apply(newsRepository.insert, news2)
      ], function(err, _insertedIds){
        newsRepository.deleteAll(function(err){
          if(err) throw err;

          newsRepository.getAll(function(err, result){
            if(err) throw err;

            assert.equal(result.length, 0);
            done();
          });
        });
      });
    });
  });
});

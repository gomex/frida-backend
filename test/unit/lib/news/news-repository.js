'use strict';

var _               = require('underscore');
var async           = require('async');

var newsRepository  = require('../../../../lib/news/news-repository');

var metadataFactory = require('../../../factories/news-attributes').metadata;
var newsFactory     = require('../../../factories/news-attributes').news;

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
        newsRepository.getAll({}, function(err, result){
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

          newsRepository.getAll({}, function(err, result){
            if(err) throw err;

            assert.equal(result.length, 0);
            done();
          });
        });
      });
    });
  });

  describe('find', function(){
    it('finds news matching some criteria', function(done){
      var metadata1 = metadataFactory.build({display_area: 'featured_1'});
      var news1 = newsFactory.build({metadata: metadata1});
      var metadata2 = metadataFactory.build({display_area: 'featured_2'});
      var news2 = newsFactory.build({metadata: metadata2});

      async.parallel([
        async.apply(newsRepository.insert, news1),
        async.apply(newsRepository.insert, news2)
      ], function(err, insertedIds){
        var criteria = {'metadata.display_area': 'featured_1'};
        newsRepository.find(criteria, null, null, null, function(err, result){
          assert.equal(result[0]._id, insertedIds[0]);
          done();
        });
      });
    });

    it('returns only the specified fields in the result set', function(done){
      var metadata1 = metadataFactory.build({display_area: 'featured_1'});
      var news1 = newsFactory.build({metadata: metadata1});
      var metadata2 = metadataFactory.build({display_area: 'featured_2'});
      var news2 = newsFactory.build({metadata: metadata2});

      async.parallel([
        async.apply(newsRepository.insert, news1),
        async.apply(newsRepository.insert, news2)
      ], function(err, _insertedIds){
        var query = {'metadata.display_area': 'featured_1'};
        var projection = {
          '_id': false,
          'title': '$metadata.title'
        };
        newsRepository.find(query, projection, null, null, function(err, result){
          assert.equal(result[0]._id, undefined);
          assert.equal(result[0].metadata, undefined);
          assert.equal(result[0].body, undefined);
          assert.equal(result[0].title, news1.metadata.title);
          done();
        });
      });
    });

    it('limits the result set to the specified amount', function(done){
      var news1 = newsFactory.build();
      var news2 = newsFactory.build();

      async.parallel([
        async.apply(newsRepository.insert, news1),
        async.apply(newsRepository.insert, news2)
      ], function(err, _insertedIds){
        newsRepository.find({}, null, 1, null, function(err, result){
          assert.equal(result.length, 1);
          done();
        });
      });
    });

    it('sorts the result set using some field', function(done){
      var metadata1 = metadataFactory.build({title: 'a'});
      var news1 = newsFactory.build({metadata: metadata1});
      var metadata2 = metadataFactory.build({title: 'b'});
      var news2 = newsFactory.build({metadata: metadata2});

      async.parallel([
        async.apply(newsRepository.insert, news1),
        async.apply(newsRepository.insert, news2)
      ], function(err, _insertedIds){
        newsRepository.find({}, null, null, { 'metadata.title': -1 }, function(err, result){
          assert.equal(result[0].metadata.title, 'b');
          assert.equal(result[1].metadata.title, 'a');
          done();
        });
      });
    });

  });

});

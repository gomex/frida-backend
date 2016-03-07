'use strict';

var assert          = require('assert');

var newsRepository  = require('../../../../lib/news/news-repository');

var metadataFactory = require('../../../factories/news-attribute').metadata;
var newsFactory     = require('../../../factories/news-attribute').newsAttribute;

describe('news-repository', function(){

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
});

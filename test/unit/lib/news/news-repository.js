'use strict';

var assert          = require('assert');

var newsRepository  = require('../../../../lib/news/news-repository');

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

});

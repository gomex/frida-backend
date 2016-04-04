var assert  = require('assert');
var sinon   = require('sinon');

var NewsUtil        = require('../../../../lib/news/news-util');
var newsAttributeFactory = require('../../../factories/news-attribute').newsAttribute;

describe('news-util:', function() {

  var clock;
  var createdAt;

  before(function () {
    createdAt = new Date(2014, 7, 25);
    clock = sinon.useFakeTimers(createdAt.getTime(), 'Date');
  });

  after(function () { clock.restore(); });

  describe('prepare news to insert',function(){
    it('sets created_at', function(done) {
      var news = newsAttributeFactory.build();
      var expect = Date.now();
      var result = NewsUtil.prepare(news);

      assert.equal(expect, result.created_at);
      done();
    });

    it('sets status to draft', function(done) {
      var news = newsAttributeFactory.build();
      var result = NewsUtil.prepare(news);

      assert.equal(result.status, 'draft');
      done();
    });

    it('removes cover field if it is not well formed', function(done) {
      var news = newsAttributeFactory.build();
      news.metadata.cover = {link: null};
      var result = NewsUtil.prepare(news);

      assert.equal(result.metadata.cover, undefined);
      done();
    });
  });
});

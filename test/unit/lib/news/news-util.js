var assert  = require('assert');
var sinon   = require('sinon');

var NewsUtil        = require('../../../../lib/news/news-util');
var newsAttributeFactory = require('../../../factories/news-attribute').newsAttribute;
var metadataFactory = require('../../../factories/news-attribute').metadata;

describe('news-util:', function() {

  var clock;
  var createdAt;

  before(function () {
    createdAt = new Date(2014, 07, 25);
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
  });

  describe('format url', function() {
    it('slugifies url using title from metadata and created date', function(done) {
      var metadata = metadataFactory.build({title: '"como" vai'});
      var news = newsAttributeFactory.build({metadata: metadata});
      var urlPath = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(news);

      assert.equal(urlPath, result.metadata.url);
      done();
    });

    it('is lower case', function(done) {
      var metadata = metadataFactory.build({title: 'CoMo Vai'});
      var news = newsAttributeFactory.build({metadata: metadata});
      var urlPath = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(news);

      assert.equal(urlPath, result.metadata.url);
      done();
    });

    it('replaces [not-a-link] to a empty string', function(done) {
      var metadata = metadataFactory.build({edition: '[not-a-link]', title: 'CoMo Vai'});
      var news = newsAttributeFactory.build({metadata: metadata});
      var urlPath = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(news);

      assert.equal(urlPath, result.metadata.url);
      done();
    });
  });
});

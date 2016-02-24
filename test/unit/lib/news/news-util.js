var assert  = require('assert');
var sinon   = require('sinon');

var NewsUtil        = require('../../../../lib/news/news-util');
var newsTestHelper  = require('../../../helpers/news');


describe('news-util:', function() {

  var clock;
  var createdAt;

  before(function () {
    createdAt = new Date(2014, 07, 25);
    clock = sinon.useFakeTimers(createdAt.getTime(), 'Date');
  });

  after(function () { clock.restore(); });

  describe('Prepare news to insert',function(){

    it('should slugify url using title on metadata', function(done) {
      var body = { metadata: {title: 'como vai'}  };
      var expect = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('sets created_at', function(done) {
      var news = newsTestHelper.createNews();
      var expect = Date.now();
      var result = NewsUtil.prepare(news);

      assert.equal(expect, result.created_at);
      done();
    });
  });

  describe('format url',function(){
    it('should be lower case', function(done) {
      var body = { metadata: {title: 'Como Vai'}  };
      var expect = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should have year, month and day of the news date on begining of url', function(done) {
      var body = { metadata: {title: 'Como Vai'}  };
      var expect = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should replace [not-a-link] to a empty string', function(done) {
      var body = { metadata: {edition: '[not-a-link]', title: '"Como" Vai'}  };
      var expect = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should remove quotation marks', function(done) {
      var body = { metadata: {title: '"Como" Vai'}  };
      var expect = '2014/08/25/como-vai/';
      var result = NewsUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should create url when title is empty', function(done) {
      var body = { metadata: {title: ''} };
      var result = NewsUtil.prepare(body);

      assert.ok(!!result.metadata.url);
      done();
    });

  });

});

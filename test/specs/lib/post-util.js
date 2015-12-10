var PostUtil = require('../../../lib/post-util');
var assert = require('assert');


describe('post-util:', function() {

  describe('Prepare post to insert',function(){
    it('should slugify url using title on metadata', function(done) {
      var body = { metadata: {title: 'como vai', date: '2014-08-25T15:32:36-03:00'}  };
      var expect = '2014/08/25/como-vai/';
      var result = PostUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should have the inserted date field', function(done){
      var body = { metadata: {title: 'como vai'}  };
      var result = PostUtil.prepare(body);

      assert.ok(result.insertDate, 'Insert date need be created');
      done();
    });

    it('should not have an _id field', function(done){
      var body = { metadata: {title: 'como vai'}, _id: 123233  };
      var result = PostUtil.prepare(body);

      assert.ok(!result._id, 'id field was not deleted');
      done();
    });

  });

  describe('format url',function(){
    it('should be lower case', function(done) {
      var body = { metadata: {title: 'Como Vai', date: '2014-08-25T15:32:36-03:00'}  };
      var expect = '2014/08/25/como-vai/';
      var result = PostUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should have year, month and day of the news date on begining of url', function(done) {
      var body = { metadata: {title: 'Como Vai', date: '2014-08-25T15:32:36-03:00'}  };
      var expect = '2014/08/25/como-vai/';
      var result = PostUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should replace [not-a-link] to a empty string', function(done) {
      var body = { metadata: {portal: '[not-a-link]',title: '"Como" Vai', date: '2014-08-25T15:32:36-03:00'}  };
      var expect = '2014/08/25/como-vai/';
      var result = PostUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should remove quotation marks', function(done) {
      var body = { metadata: {title: '"Como" Vai', date: '2014-08-25T15:32:36-03:00'}  };
      var expect = '2014/08/25/como-vai/';
      var result = PostUtil.prepare(body);

      assert.equal(expect, result.metadata.url);
      done();
    });

    it('should create url when title does not exist', function(done) {
      var body = { metadata: {} };
      var result = PostUtil.prepare(body);

      assert.ok(!!result.metadata.url);
      done();
    });

    it('should create url when title is empty', function(done) {
      var body = { metadata: {title: ''} };
      var result = PostUtil.prepare(body);

      assert.ok(!!result.metadata.url);
      done();
    });

  });

});
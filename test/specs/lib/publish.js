var publish = require('../../../lib/publish')();
var fs = require('fs');
var assert = require('assert');


describe('Publish:', function() {

  it('should create a empty string when post does not have body and metadata', function(done) {
    var post = {};
    var result = publish.toYAML().read();
    var expect = '';

    assert.equal(expect, result);
    done();
  });

  describe('String on FrontMatters pattern',function(){
    it('should add body on string', function(done) {
      var post = { body:'<strong>Bolo doido</strong>', metadata: {date: 'como vai'}  };
      var result = publish.toYAML(post).read();
      var expect = "---\ndate: como vai\n---\n<strong>Bolo doido</strong>\n";

      assert.equal(expect, result);
      done();
    });
  });

  describe('markdown file on file system',function(){
    it('should save a file on a specify path', function(done) {
      var id = 'a124b124c124';
      var post = { _id: id, body:'<strong>Bolo doido</strong>', metadata: {date: '2015-08-10', title: 'Titulo novo 2012'}  };
      var expect = "---\ndate: \'2015-08-10\'\ntitle: Titulo novo 2012\n---\n<strong>Bolo doido</strong>\n";

      publish.toYAML(post, id, '2015', '08').write('/tmp', function(err){
        var data = fs.readFileSync('/tmp/2015/08/'+id+'.md','utf8');
        assert.equal(expect, data);

        done();
      });
    });

  });
});

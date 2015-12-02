var publish = require('../../../../lib/publisher/hexo')();
var fs = require('fs');
var assert = require('assert');


describe('Publish:', function() {

  it('should create a empty string when post does not have body and metadata', function(done) {
    var post = {};
    var result = publish.post().read();
    var expect = '';

    assert.equal(expect, result);
    done();
  });

  describe('String on FrontMatters pattern',function(){
    it('should add body on string', function(done) {
      var post = { body:'<strong>Bolo doido</strong>', metadata: {date: 'como vai'}  };
      var result = publish.post(post).read();
      var expect = "---\ndate: como vai\n---\n<strong>Bolo doido</strong>\n";

      assert.equal(expect, result);
      done();
    });
  });

  describe('markdown file on file system',function(){
    it('should save a file on the specified path', function(done) {
      var id = 'a124b124c124';
      var post = { _id: id, body:'<strong>Bolo doido</strong>', metadata: {date: '2015-08-10', title: 'Titulo novo 2012'}  };
      var expect = "---\ndate: \'2015-08-10\'\ntitle: Titulo novo 2012\n---\n<strong>Bolo doido</strong>\n";

      publish.post(post, id, '2015', '08').write('/tmp', function(err){
        var data = fs.readFileSync('/tmp/2015/08/'+id+'.md','utf8');
        assert.equal(expect, data);

        done();
      });
    });
  });

  describe('home markdown',function(){
    it('should exist a way to generate home markdown', function(done) {
      assert.ok(publish.home);
      done();
    });

    it('should set layout accordingly to the home', function(done) {
      var expected = "---\n"+
                    "layout: nacional\n"+
                   "---\n\n";

      assert.equal(publish.home('nacional', { }).read(), expected);
      done();
    });

    it('should convert home object to YAML', function(done) {
      var posts = [{title: 'titulo 1'}, {title: 'titulo 2'}];
      var expected = "---\n"+
                   "featured:\n"+
                   "  - title: titulo 1\n"+
                   "  - title: titulo 2\n"+
                   "layout: nacional\n"+
                   "---\n\n";

      assert.equal(publish.home('nacional', { featured: posts }).read(), expected);
      done();
    });

    it('should save a index on the specified path', function(done) {
      var posts = [{title: 'titulo 1'}, {title: 'titulo 2'}];
      var expected = "---\n"+
                   "featured:\n"+
                   "  - title: titulo 1\n"+
                   "  - title: titulo 2\n"+
                   "layout: nacional\n"+
                   "---\n\n";

      publish.home('nacional',{ featured: posts}).write('/tmp', function(err){
        var data = fs.readFileSync('/tmp/index.md','utf8');
        assert.equal(expected, data);

        done();
      });
    });
  });
});

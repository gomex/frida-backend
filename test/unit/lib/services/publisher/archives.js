/*eslint no-undef: "off"*/
var archives = require('lib/services/publisher/archives.js');
var hexo = require('lib/services/hexo');
var postFactory = require('test/factories/post-attributes').post;
var News = require('lib/models/news');


describe('Chronological file', () => {
  var subject = (callback) =>  archives.publish(callback);

  given('post', () => new News(postFactory.build({ published_at: new Date()})));


  beforeEach((done) => { post.save(done); });
  beforeEach(() => {
    sandbox.stub(hexo, 'publishArchive').yields();
  });

  it('succeeds', (done) => {
    subject(done);
  });

  it('publishes with hexo', (done) => {
    subject((err) => {
      var args = hexo.publishArchive.args[0];
      expect(args[0].list[0].metadata.title).to.deep.equal(post.metadata.title);

      done(err);
    });
  });

  it('publishes with Date', (done) => {
    subject((err) => {
      var args = hexo.publishArchive.args[0];
      expect(args[0].year).equal(post.published_at.getFullYear());
      expect(args[0].month).equal(post.published_at.getMonth());

      done(err);    	
    });
  });
});
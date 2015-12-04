var hexo = require('../../../../lib/publisher/hexo')();
var fs = require('fs');
var slug = require('slug');
var matters =  require('gray-matter');
var assert = require('assert');


describe('Hexo publisher:', function() {

  it('creates the news file in the configured hexo posts folder', function(done) {
     var now = new Date();
     var title = 'title-' + now;
     var news =  {
                    _id: 'news_ident-' + now.getTime(),
	                body:'<h1>the news content</h1>',
	                status: 'published',
	                metadata: {
	                    date: now,
                        published_at: now,
	                    title: title,
	                    description: 'description',
	                    cover: {
	                        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
	                    }
	                }
	            };

      hexo.publish(news, function(httpPath) {
        var year  = news.metadata.published_at.getFullYear();
        var month = news.metadata.published_at.getMonth() + 1;

        var httpExpectedPath = year + '/' + month + '/' + slug(news.metadata.title) + '/';
        var expectedPath = process.env.HEXO_POSTS_PATH + '/' + year + '/' + month + '/' + news._id + '.md';
        assert.equal(httpPath, httpExpectedPath);
        assert.ok(fs.existsSync(expectedPath));

        done();
      });
  });

  it('news file is an markdown representation of the news object', function(done) {
     var now = new Date();
     var title = 'title-' + now;
     var news =  {
                    _id: 'news_ident-' + now.getTime(),
	                body:'<h1>the news content</h1>',
	                status: 'published',
	                metadata: {
	                    date: now,
                        published_at: now,
	                    title: title,
	                    description: 'description',
	                    cover: {
	                        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
	                    }
	                }
	            };

      hexo.publish(news, function(httpPath) {
        var year  = news.metadata.published_at.getFullYear();
        var month = news.metadata.published_at.getMonth() + 1;
        var expectedPath    = process.env.HEXO_POSTS_PATH + '/' + year + '/' + month + '/' + news._id + '.md';

        var expectedContent = matters.stringify(news.body, news.metadata);

        var actualContent = fs.readFileSync(expectedPath, 'utf8');
        assert.equal(actualContent, expectedContent);

        done();
      });
  });

  it('fails if the news object is not well formed', function(done) {
     var now = new Date();
     var title = 'title-' + now;
     var news =  { };

     assert.throws(function() {
         hexo.publish(news, function(httpPath) {})
     }, TypeError);

     done();
  });

  it('creates home metadata file in the configured hexo posts folder', function(done) {
     var now = new Date();
     var title = 'title-' + now;
     var news =  {
                    _id: 'news_ident-' + now.getTime(),
	                body:'<h1>the news content</h1>',
	                status: 'published',
	                metadata: {
	                    date: now,
                        published_at: now,
	                    title: title,
	                    description: 'description',
	                    cover: {
	                        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
	                    }
	                }
	            };

    var expectedPath = process.env.HEXO_POSTS_PATH + '/../index.md';
    try { fs.unlinkSync(expectedPath); } catch(e) { /* ignore */ }

    hexo.publish(news, function(httpPath) {
        assert.ok(fs.existsSync(expectedPath));

        done();
    });
  });
});

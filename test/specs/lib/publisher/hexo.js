var hexo = require('../../../../lib/publisher/hexo');
var fs = require('fs');
var slug = require('slug');
var matters =  require('gray-matter');
var assert = require('assert');
var moment = require('moment');


describe('Hexo publisher:', function() {

  var nationalEdition = '[not-a-link]';

  describe('publish', function() {
    it('creates the news file in the configured hexo posts folder', function(done) {
       var now = new Date();
       var title = 'title-' + now;
       var news =  {
                      _id: 'news_ident-' + now.getTime(),
  	                body:'<h1>the news content</h1>',
  	                status: 'published',
                    published_at: now,
  	                metadata: {
  	                    date: now,
  	                    title: title,
  	                    description: 'description',
  	                    cover: {
  	                        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
  	                    },
                        edition: nationalEdition
  	                }
  	            };

        hexo.publish(news, function(httpPath) {
          var newsPublishedAt = moment(news.published_at);
          var year  = newsPublishedAt.format('YYYY');
          var month = newsPublishedAt.format('MM');

          var httpExpectedPath = year + '/' + month + '/' + slug(news.metadata.title) + '/';
          var expectedPath = process.env.HEXO_SOURCE_PATH + '/_posts/' + year + '/' + month + '/' + news._id + '.md';
          assert.equal(httpPath, httpExpectedPath);
          assert.ok(fs.existsSync(expectedPath));

          done();
        });
    });

    it('news file is an YAML front matter representation of the news object', function(done) {
       var now = new Date();
       var title = 'title-' + now;
       var news =  {
                      _id: 'news_ident-' + now.getTime(),
  	                body:'<h1>the news content</h1>',
  	                status: 'published',
                    published_at: now,
  	                metadata: {
  	                    date: now,
  	                    title: title,
  	                    description: 'description',
  	                    cover: {
  	                        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
  	                    },
                        edition: nationalEdition
  	                }
  	            };

        hexo.publish(news, function(httpPath) {
          var newsPublishedAt = moment(news.published_at);
          var year  = newsPublishedAt.format('YYYY');
          var month = newsPublishedAt.format('MM');
          var expectedPath    = process.env.HEXO_SOURCE_PATH + '/_posts/' + year + '/' + month + '/' + news._id + '.md';

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
  });

  describe('updateHome', function() {
    it('creates home metadata file in the configured hexo posts folder', function(done) {
       var now = new Date();
       var title = 'title-' + now;
       var news =  {
                      _id: 'news_ident-' + now.getTime(),
  	                body:'<h1>the news content</h1>',
  	                status: 'published',
                    published_at: now,
  	                metadata: {
  	                    date: now,
  	                    title: title,
  	                    description: 'description',
  	                    cover: {
  	                        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
  	                    },
                        edition: nationalEdition
  	                }
  	            };

      var expectedPath = process.env.HEXO_SOURCE_PATH + '/index.md';
      try { fs.unlinkSync(expectedPath); } catch(e) { /* ignore */ }

      hexo.updateHome(nationalEdition, function() {
          assert.ok(fs.existsSync(expectedPath));

          done();
      });
    });
  });
});

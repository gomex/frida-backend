var _           = require('underscore');
var assert      = require('assert');
var fs          = require('fs');
var grayMatter  = require('gray-matter');
var moment      = require('moment');
var slug        = require('slug');

var metadataFactory = require('../../../factories/news-attribute').metadata;
var newsFactory     = require('../../../factories/news-attribute').newsAttribute;

var hexo            = require('../../../../lib/publisher/hexo');

describe('hexo', function() {

  describe('publish', function() {
    it('creates the news file in the configured hexo posts folder', function(done) {
      var news = newsFactory.build({ published_at: new Date(12345) });

      hexo.publish(news, function(_err, httpPath) {
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
      var news = newsFactory.build({ published_at: new Date(12345) });

      hexo.publish(news, function(_err, _httpPath) {
        var newsPublishedAt = moment(news.published_at);
        var year  = newsPublishedAt.format('YYYY');
        var month = newsPublishedAt.format('MM');
        var expectedPath    = process.env.HEXO_SOURCE_PATH + '/_posts/' + year + '/' + month + '/' + news._id + '.md';

        var data = _.extend(news.metadata, {date: news.published_at});
        var expectedContent = grayMatter.stringify(news.body, data);

        var actualContent = fs.readFileSync(expectedPath, 'utf8');
        assert.equal(actualContent, expectedContent);

        done();
      });
    });

    it('fails if the news object is not well formed', function(done) {
      var news =  { };

      assert.throws(function() {
        hexo.publish(news, function(_err, _httpPath) {});
      }, TypeError);

      done();
    });

  });

  describe('updateAreaPage', function() {
    var news;

    before(function(done) {
      var metadata = metadataFactory.build({ url: '2016/03/news-' + Date.now() });
      news = newsFactory.build({ metadata: metadata, published_at: new Date(), status: 'published' });

      done();
    });

    it('creates area page file in the correspondent hexo source folder', function(done) {
      var expectedPath = process.env.HEXO_SOURCE_PATH + '/' + news.metadata.area  + '/index.md';

      try { fs.unlinkSync(expectedPath); } catch(e) { /* make sure the file was not there before test execution */ }

      hexo.updateAreaPage(news.metadata.area, function(err) {
        assert.equal(null, err);
        assert.ok(fs.existsSync(expectedPath));

        done();
      });
    });

    it('area page data file is valid front matter', function(done) {
      hexo.updateAreaPage(news.metadata.area, function(err) {
        assert.equal(null, err);

        var areaIndexFilePath = process.env.HEXO_SOURCE_PATH + '/' + news.metadata.area  + '/index.md';
        var areaIndexFile   = fs.readFileSync(areaIndexFilePath, 'utf-8');
        var areaIndexData = grayMatter(areaIndexFile);

        assert.notEqual(areaIndexData.data, null);

        done();
      });
    });

  });

  describe('updateHomePage', function() {
    it('creates home metadata file in the configured hexo posts folder', function(done) {
      var expectedPath = process.env.HEXO_SOURCE_PATH + '/index.md';
      try { fs.unlinkSync(expectedPath); } catch(e) { /* ignore */ }

      hexo.updateHomePage(function() {
        assert.ok(fs.existsSync(expectedPath));

        done();
      });
    });

    it('home page data file is valid front matter', function(done) {
      hexo.updateHomePage(function(err) {
        assert.equal(null, err);

        var homePageDataFilePath = process.env.HEXO_SOURCE_PATH + '/index.md';
        var homePageDataFile   = fs.readFileSync(homePageDataFilePath, 'utf-8');
        var homePageData = grayMatter(homePageDataFile);

        assert.notEqual(homePageData.data, null);

        done();
      });
    });
  });
});

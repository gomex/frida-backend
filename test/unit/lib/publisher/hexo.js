var fs          = require('fs');
var grayMatter  = require('gray-matter');
var moment      = require('moment');

var newsFactory     = require('../../../factories/news-attributes').news;
var hexo            = require('../../../../lib/publisher/hexo');
var path = require('path');

describe('hexo', function() {

  describe('unpublish', function() {
    var subject = function(callback) { return hexo.unpublish(news, callback); };

    var news = {
      _id: '123',
      published_at: new Date()
    };

    var newsPath = function() {
      var dir = moment(news.published_at).format('YYYY/MM');
      return path.join(process.env.HEXO_SOURCE_PATH, '_posts', dir, news._id + '.md');
    }();

    beforeEach(function() {
      sandbox.stub(fs, 'unlink').yields(null);
    });

    it('exists', function() {
      expect(hexo.unpublish).to.exist;
    });

    it('removes md file', function(done) {
      subject(function(err) {
        expect(fs.unlink).to.have.been.calledWith(newsPath);

        done(err);
      });
    });

    describe('when the md file does not exist', function() {

      beforeEach(function() {
        fs.unlink.restore();
        sandbox.stub(fs, 'unlink').yields({ code: 'ENOENT' });
      });

      it('succeeds', function(done) {
        subject(function(err) {
          expect(err).to.not.exist;

          done(err);
        });
      });
    });
  });

  describe('publish', function() {
    it('creates the news file in the configured hexo posts folder', function(done) {
      var news = newsFactory.build({ published_at: new Date(12345) });

      hexo.publish(news, function(_err) {
        var newsPublishedAt = moment(news.published_at);
        var year  = newsPublishedAt.format('YYYY');
        var month = newsPublishedAt.format('MM');

        var expectedPath = process.env.HEXO_SOURCE_PATH + '/_posts/' + year + '/' + month + '/' + news._id + '.md';
        assert.ok(fs.existsSync(expectedPath));

        done();
      });
    });

    it('news file is an YAML front matter representation of the news object', function(done) {
      var news = newsFactory.build({ published_at: new Date(12345) });

      hexo.publish(news, function(_err) {
        var newsPublishedAt = moment(news.published_at);
        var year  = newsPublishedAt.format('YYYY');
        var month = newsPublishedAt.format('MM');
        var expectedPath    = process.env.HEXO_SOURCE_PATH + '/_posts/' + year + '/' + month + '/' + news._id + '.md';

        var data = Object.assign({date: news.published_at}, news.metadata);
        var expectedContent = grayMatter.stringify(news.body, data);

        var actualContent = fs.readFileSync(expectedPath, 'utf8');
        assert.equal(actualContent, expectedContent);

        done();
      });
    });
  });

  describe('updateAreaPage', function() {

    describe('when area is not column', function() {
      var area = 'internacional';

      it('creates area page file in the correspondent hexo source folder', function(done) {
        var expectedPath = process.env.HEXO_SOURCE_PATH + '/' + area  + '/index.md';

        try { fs.unlinkSync(expectedPath); } catch(e) { /* make sure the file was not there before test execution */ }

        hexo.updateAreaPage(area, function(err) {
          assert.equal(null, err);
          assert.ok(fs.existsSync(expectedPath));

          done();
        });
      });

      it('area page data file is valid front matter', function(done) {
        hexo.updateAreaPage(area, function(err) {
          assert.equal(null, err);

          var areaIndexFilePath = process.env.HEXO_SOURCE_PATH + '/' + area  + '/index.md';
          var areaIndexFile   = fs.readFileSync(areaIndexFilePath, 'utf-8');
          var areaIndexData = grayMatter(areaIndexFile);

          assert.notEqual(areaIndexData.data, null);

          done();
        });
      });
    });

    describe('when area is column', function() {
      var area = 'column';

      it('creates column page file in a folder named "colunistas" under hexo source folder', function(done) {
        var expectedPath = process.env.HEXO_SOURCE_PATH + '/colunistas/index.md';

        try { fs.unlinkSync(expectedPath); } catch(e) { /* make sure the file was not there before test execution */ }

        hexo.updateAreaPage(area, function(err) {
          assert.equal(null, err);
          assert.ok(fs.existsSync(expectedPath));

          done();
        });
      });

      it('column page data file is valid front matter', function(done) {
        hexo.updateAreaPage(area, function(err) {
          assert.equal(null, err);

          var areaIndexFilePath = process.env.HEXO_SOURCE_PATH + '/colunistas/index.md';
          var areaIndexFile   = fs.readFileSync(areaIndexFilePath, 'utf-8');
          var areaIndexData = grayMatter(areaIndexFile);

          assert.notEqual(areaIndexData.data, null);

          done();
        });
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

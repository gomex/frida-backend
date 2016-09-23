/*eslint no-undef: "off"*/

var fs = require('fs');
var grayMatter = require('gray-matter');
var moment = require('moment');
var YAML = require('js-yaml');

var postFactory = require('../../../factories/post-attributes').post;
var advertisingFactory = require('../../../factories/advertising-attributes').advertising;
var newsMetadataFactory = require('../../../factories/news-attributes').metadata;
var advertisingMetadataFactory = require('../../../factories/advertising-attributes').metadata;
var postPublisher = require('../../../../lib/publisher/presenters/post');
var presenter = require('../../../../lib/publisher/presenter');
var News = require('../../../../lib/models/news');
var hexo = require('../../../../lib/publisher/hexo');
var path = require('path');
var staticFiles = require('../../../../lib/publisher/static-files');

describe('hexo', function() {

  describe('unpublish', function() {
    var subject = function(callback) { return hexo.unpublish(news, callback); };

    given('news', () => postFactory.build({
      published_at: new Date(),
      metadata: newsMetadataFactory.build({url: 'url'})
    }));

    given('newsPath', () => {
      var dir = moment(news.published_at).format('YYYY/MM');
      return path.join(process.env.HEXO_SOURCE_PATH, '_posts', dir, news._id + '.md');
    });

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

    describe('when the files does not exist', function() {
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
    var subject = function(callback) { return hexo.publish(news, callback); };

    given('metadata', () => newsMetadataFactory.build({url: 'url'}));
    given('news', () => new News(postFactory.build({
      published_at: new Date(), metadata: metadata
    })));

    beforeEach(function() {
      sandbox.spy(presenter, 'of');
    });

    describe('', () => {
      beforeEach(function() {
        sandbox.spy(postPublisher, 'getData');
      });

      it('gets news data', function(done) {
        subject(function(err) {
          expect(postPublisher.getData).to.have.been.called;

          done(err);
        });
      });
    });

    it('creates the news file in the configured hexo posts folder', function(done) {
      subject(function(err) {
        var newsPublishedAt = moment(news.published_at);
        var year  = newsPublishedAt.format('YYYY');
        var month = newsPublishedAt.format('MM');

        var expectedPath = process.env.HEXO_SOURCE_PATH + '/_posts/' + year + '/' + month + '/' + news._id + '.md';
        expect(fs.statSync(expectedPath).isFile()).to.be.true;

        done(err);
      });
    });

    it('gets presenter for news', function(done) {
      subject(function(err) {
        expect(presenter.of).to.have.been.calledWith(news);

        done(err);
      });
    });
  });

  describe('.publishStaticFiles', () => {
    var subject = (callback) => hexo.publishStaticFiles(callback);

    beforeEach(() => {
      sandbox.stub(staticFiles, 'generate').yields(null);
    });

    it('exists', () => {
      expect(hexo.publishStaticFiles).to.exist;
    });

    it('generates files', (done) => {
      subject((err) => {
        expect(staticFiles.generate).to.have.been.calledWith('quem_somos', 'static_about');
        expect(staticFiles.generate).to.have.been.calledWith('contato', 'static_contact');
        expect(staticFiles.generate).to.have.been.calledWith('mapa_do_site', 'static_sitemap');
        expect(staticFiles.generate).to.have.been.calledWith('publicidade', 'static_advertising');
        expect(staticFiles.generate).to.have.been.calledWith('parceiros', 'partners');

        done(err);
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

  describe('updateAdvertisingData', function() {
    given('metadata', () => advertisingMetadataFactory.build({display_area: 'advertising_06'}));
    given('expectedDataDir', () => path.join(process.env.HEXO_SOURCE_PATH, '_data'));
    given('expectedPath', () => path.join(expectedDataDir, 'advertisings.yml'));

    beforeEach(function() {
      if (!fs.existsSync(expectedDataDir)){
        fs.mkdirSync(expectedDataDir);
      }
    });

    describe('when in-news advertising is beig unpublished', function() {
      given('news', () => new News(advertisingFactory.build({status: 'changed', metadata: metadata})));

      it('creates advertising yaml file in the configured hexo data folder', function(done) {
        try { fs.unlinkSync(expectedPath); } catch(e) { /* ignore */ }

        hexo.updateAdvertisingData(news, function() {
          assert.ok(fs.existsSync(expectedPath));
          done();
        });
      });

      it('advertising data file is empty yaml', function(done) {
        try { fs.unlinkSync(expectedPath); } catch(e) { /* ignore */ }
        var expectedYaml = '';
        hexo.updateAdvertisingData(news, function() {
          var writtenYaml = fs.readFileSync(expectedPath, 'utf8');
          assert.equal(writtenYaml, expectedYaml);
          done();
        });
      });
    });

    describe('when in-news advertising is beig published', function() {
      given('news', () => new News(advertisingFactory.build({status: 'published', metadata: metadata})));

      it('creates advertising yaml file in the configured hexo data folder', function(done) {
        try { fs.unlinkSync(expectedPath); } catch(e) { /* ignore */ }

        hexo.updateAdvertisingData(news, function() {
          assert.ok(fs.existsSync(expectedPath));
          done();
        });
      });

      it('advertising data file has yaml for advertising', function(done) {
        try { fs.unlinkSync(expectedPath); } catch(e) { /* ignore */ }

        hexo.updateAdvertisingData(news, function() {
          var writtenYaml = YAML.safeLoad(fs.readFileSync(expectedPath, 'utf8'));
          var writtenDataList = Object.keys(writtenYaml);

          expect(writtenDataList).to.have.lengthOf(1);
          expect(writtenYaml[writtenDataList[0]]).to.have.all.keys('title', 'image', 'link');

          done();
        });
      });
    });
  });
});

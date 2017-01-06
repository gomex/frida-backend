/*eslint no-undef: "off"*/

var fs = require('fs');
var grayMatter = require('gray-matter');
var moment = require('moment');

var postFactory = require('../../../factories/post-attributes').post;
var newsMetadataFactory = require('../../../factories/news-attributes').metadata;
var postPublisher = require('../../../../lib/publisher/presenters/post');
var radioAgenciaPresenter = require('../../../../lib/publisher/presenters/radio-agencia');
var bdfPresenter = require('../../../../lib/publisher/presenters/bdf');
var presenter = require('../../../../lib/publisher/presenter');
var News = require('../../../../lib/models/news');
var Home = require('../../../../lib/models/home');
var hexo = require('../../../../lib/publisher/hexo');
var path = require('path');
var writer = require('../../../../lib/publisher/writer');

describe('hexo', function() {
  describe('unpublish', function() {
    var subject = function(callback) { return hexo.unpublish(news, callback); };

    given('news', () => postFactory.build({
      published_at: new Date(),
      metadata: newsMetadataFactory.build({url: 'url'})
    }));

    given('newsPath', () => {
      var dir = moment(news.published_at).format('YYYY/MM');
      return path.join('_posts', dir, news._id + '.md');
    });

    beforeEach(function() {
      sandbox.stub(writer, 'remove').yields(null);
    });

    it('exists', function() {
      expect(hexo.unpublish).to.exist;
    });

    it('removes md file', function(done) {
      subject(function(err) {
        expect(writer.remove).to.have.been.calledWith(newsPath);

        done(err);
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

  describe('.publishHome', () => {
    var subject = (callback) => hexo.publishHome(home, callback);

    given('home', () => new Home({
      name: 'some_name',
      path: '/some_path'
    }));
    given('homeData', () => ({some: 'data'}));
    given('stringified', () => grayMatter.stringify('', homeData));

    beforeEach(() => {
      sandbox.stub(writer, 'write').yields(null);
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('writes home', (done) => {
      subject((err) => {
        expect(writer.write).to.have.been.calledWith(`${home.path}/index.md`);

        done(err);
      });
    });

    describe('when is radio agencia', () => {
      given('home', () => new Home({
        name: 'radio_agencia',
        path: '/radioagencia'
      }));

      beforeEach(() => {
        sandbox.stub(radioAgenciaPresenter, 'getData').returns(homeData);
      });

      it('gets data', (done) => {
        subject((err) => {
          expect(radioAgenciaPresenter.getData).to.have.been.calledWith(home);

          done(err);
        });
      });

      it('writes home', (done) => {
        subject((err) => {
          expect(writer.write).to.have.been.calledWith(`${home.path}/index.md`, stringified);

          done(err);
        });
      });
    });

    describe('when is bdf', () => {
      given('home', () => new Home({
        name: 'bdf',
        path: ''
      }));

      beforeEach(() => {
        sandbox.stub(bdfPresenter, 'getData').returns(homeData);
      });

      it('gets data', (done) => {
        subject((err) => {
          expect(bdfPresenter.getData).to.have.been.calledWith(home);

          done(err);
        });
      });

      it('writes home', (done) => {
        subject((err) => {
          expect(writer.write).to.have.been.calledWith('index.md', stringified);

          done(err);
        });
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
});

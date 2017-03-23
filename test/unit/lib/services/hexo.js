/*eslint no-undef: "off"*/

var fs = require('fs');
var grayMatter = require('gray-matter');
var moment = require('moment');

var postFactory = require('test/factories/post-attributes').post;
var newsMetadataFactory = require('test/factories/news-attributes').metadata;
var postPublisher = require('lib/services/publisher/presenter/post');
var radioAgenciaPresenter = require('lib/services/publisher/presenter/radio-agencia');
var bdfPresenter = require('lib/services/publisher/presenter/bdf');
var presenter = require('lib/services/publisher/presenter');
var News = require('lib/models/news');
var Home = require('lib/models/home');
var hexo = require('lib/services/hexo');
var path = require('path');
var hexoSource = require('lib/services/hexo/source');

describe('hexo', () => {
  describe('unpublish', () => {
    var subject = (callback) => hexo.unpublish(news, callback);

    given('news', () => postFactory.build({
      published_at: new Date(),
      metadata: newsMetadataFactory.build({url: 'url'})
    }));

    given('newsPath', () => {
      var dir = moment(news.published_at).format('YYYY/MM');
      return path.join('_posts', dir, news._id + '.md');
    });

    beforeEach(() => {
      sandbox.stub(hexoSource, 'remove').yields(null);
    });

    it('exists', () => {
      expect(hexo.unpublish).to.exist;
    });

    it('removes md file', (done) => {
      subject((err) => {
        expect(hexoSource.remove).to.have.been.calledWith(newsPath);

        done(err);
      });
    });
  });

  describe('publish', () => {
    var subject = (callback) => hexo.publish(news, callback);

    given('metadata', () => newsMetadataFactory.build({url: 'url'}));
    given('news', () => new News(postFactory.build({
      published_at: new Date(), metadata: metadata
    })));

    beforeEach(() => {
      sandbox.spy(presenter, 'of');
    });

    describe('', () => {
      beforeEach(() => {
        sandbox.spy(postPublisher, 'getData');
      });

      it('gets news data', (done) => {
        subject((err) => {
          expect(postPublisher.getData).to.have.been.called;

          done(err);
        });
      });
    });

    it('creates the news file in the configured hexo posts folder', (done) => {
      subject((err) => {
        var newsPublishedAt = moment(news.published_at);
        var year = newsPublishedAt.format('YYYY');
        var month = newsPublishedAt.format('MM');

        var expectedPath = process.env.HEXO_SOURCE_PATH + '/_posts/' + year + '/' + month + '/' + news._id + '.md';
        expect(fs.statSync(expectedPath).isFile()).to.be.true;

        done(err);
      });
    });

    it('gets presenter for news', (done) => {
      subject((err) => {
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
      sandbox.stub(hexoSource, 'write').yields(null);
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('writes home', (done) => {
      subject((err) => {
        expect(hexoSource.write).to.have.been.calledWith(`${home.path}/index.md`);

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
          expect(hexoSource.write).to.have.been.calledWith(`${home.path}/index.md`, stringified);

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
          expect(hexoSource.write).to.have.been.calledWith('index.md', stringified);

          done(err);
        });
      });
    });
  });
});

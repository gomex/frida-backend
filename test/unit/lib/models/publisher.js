/*eslint no-undef: "off"*/
'use strict';

var _ = require('lodash');
var publisher = require('../../../../lib/models/publisher');
var News = require('../../../../lib/models/news');
var Home = require('../../../../lib/models/home');
var tabloids = require('../../../../lib/models/news/tabloids');
var photoCaptions = require('../../../../lib/models/news/photo-captions');
var bdf = require('../../../../lib/models/home/bdf');
var hexo = require('../../../../lib/publisher/hexo');
var site = require('../../../../lib/publisher/site');
var newsFactory = require('../../../factories/news-attributes').news;
var metadataFactory = require('../../../factories/news-attributes').metadata;
var tabloidFactory = require('../../../factories/tabloid-attributes').tabloid;
var tabloidNewsFactory = require('../../../factories/tabloid-news-attributes').tabloid;
var photoCaptionFactory = require('../../../factories/photo-caption-attributes').photoCaption;

describe('publisher', function() {
  describe('.publishLater', () => {
    var subject = (news, callback) => { publisher.publishLater(news, callback); };

    var metadata = metadataFactory.build();
    given('news', () => new News(newsFactory.build(
      {
        metadata: metadata,
        published_at: new Date(),
        updated_at: new Date(),
        status: 'draft'
      }
    )));

    it('sets news status to "pending"', (done) => {
      subject(news, (err, publishedNews) => {
        expect(publishedNews.status).to.be.equal('pending');
        done(err);
      });
    });
  });

  describe('.publish', function() {
    var subject = function(news, callback) { publisher.publish([news], callback); };

    given('news', () => new News(newsFactory.build(
      {
        published_at: new Date(),
        updated_at: new Date(),
        status: 'draft'
      }
    )));
    given('bdf', () => new Home({name: 'bdf'}));
    given('radioAgencia', () => new Home({name: 'radio_agencia'}));

    beforeEach(function() {
      sandbox.stub(publisher, 'publishHome').yields(null);
      sandbox.stub(news, 'save').yields(null);
      sandbox.stub(hexo, 'publish').yields(null);
      sandbox.stub(hexo, 'publishList').yields(null);

      var stub = sandbox.stub(Home, 'findByName');
      stub.withArgs('bdf').yields(null, bdf);
      stub.withArgs('radio_agencia').yields(null, radioAgencia);
    });

    describe('when news is not published', function() {
      it('updates status on database', function(done){
        subject(news, function(err) {
          expect(news.save).to.have.been.called;

          done(err);
        });
      });

      it('creates news data file', function(done){
        subject(news, function(err) {
          expect(hexo.publish).to.have.been.called;

          done(err);
        });
      });

      it('updates area data file', function(done){
        subject(news, function(err) {
          expect(hexo.publishList).to.have.been.calledWith({
            layout: 'news_list',
            area: news.metadata.area,
            path: news.metadata.area,
            news: []
          });

          done(err);
        });
      });

      it('updates last news data file', function(done){
        subject(news, function(err) {
          expect(hexo.publishList).to.have.been.calledWith({
            layout: 'news_list',
            area: 'ultimas_noticias',
            path: 'ultimas_noticias',
            news: []
          });

          done(err);
        });
      });

      it('sets url', function(done) {
        subject(news, function(err, publishedNews) {
          expect(publishedNews[0].metadata.url).to.exist;

          done(err);
        });
      });

      it('publishes bdf home', (done) => {
        subject(news, function(err) {
          expect(publisher.publishHome).to.have.been.calledWith(bdf);

          done(err);
        });
      });

      it('publishes radio_agencia home', (done) => {
        subject(news, function(err) {
          expect(publisher.publishHome).to.have.been.calledWith(radioAgencia);

          done(err);
        });
      });

      describe('and the area is "radioagencia"', function() {
        beforeEach(function() {
          news.metadata.area = 'radioagencia';
        });

        it('does not update area data file', function(done){
          subject(news, function(err) {
            expect(hexo.publishList).to.not.have.been.calledWithMatch({
              area: 'radioagencia',
            });

            done(err);
          });
        });

        describe('and it is a service', function() {
          var behaveAsService = function(tag, path) {
            beforeEach(function() {
              news.tags = [tag];
            });

            it('updates area', function(done){
              subject(news, function(err) {
                expect(hexo.publishList).to.have.been.calledWith({
                  layout: 'news_list',
                  area: tag,
                  path: `radioagencia/${path}`,
                  news: []
                });

                done(err);
              });
            });
          };

          describe('hoje na historia', () => {
            behaveAsService('hojenahistoria', 'hoje-na-historia');
          });

          describe('alimento e saude', () => {
            behaveAsService('alimentoesaude', 'alimento-e-saude');
          });

          describe('nossos direitos', () => {
            behaveAsService('nossosdireitos', 'nossos-direitos');
          });

          describe('fatos curiosos', () => {
            behaveAsService('fatoscuriosos', 'fatos-curiosos');
          });

          describe('mosaico cultural', () => {
            behaveAsService('mosaicocultural', 'mosaico-cultural');
          });
        });
      });
    });

    describe('when news is already published', function() {
      describe('and was modified', function() {
        var metadata = metadataFactory.build({ url: '/2016/05/21/what' });
        given('news', () => new News(newsFactory.build({
          metadata: metadata,
          published_at: new Date(1000),
          updated_at: new Date(),
          status: 'changed'
        })));

        beforeEach(function() {
          sandbox.stub(news, 'save').yields(null);
        });

        it('does not change original published_at date', function(done) {
          subject(_.clone(news), function(err, publishedNews) {
            expect(publishedNews[0].published_at).to.be.equal(news.published_at);

            done(err);
          });
        });

        it('does not change url if title changes', function(done) {
          var oldUrl = news.metadata.url;
          news.metadata.title = 'different title';

          subject(news, function(err, publishedNews) {
            expect(publishedNews[0].metadata.url).to.be.equal(oldUrl);

            done(err);
          });
        });
      });

      describe('and was not changed', function() {
        var metadata = metadataFactory.build();
        given('news', () => new News(newsFactory.build({
          metadata: metadata,
          published_at: new Date(),
          updated_at: new Date(1000),
          status: 'published'
        })));

        beforeEach(function() {
          sandbox.stub(news, 'save').yields(null);
        });

        it('returns error', function(done) {
          subject(news, function(err) {
            expect(err).to.exist;

            done();
          });
        });
      });
    });

    describe('when is a tabloid', () => {
      given('aTabloid', () => new News(tabloidFactory.build({
        status: 'draft'
      })));
      given('newsList', () => [new News(tabloidNewsFactory.build()), new News(tabloidNewsFactory.build())]);

      beforeEach(() => {
        sandbox.stub(tabloids, 'findNews').yields(null, newsList);
        sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
      });

      it('searches news', (done) => {
        subject(aTabloid, (err) => {
          expect(tabloids.findNews).to.have.been.calledWith(aTabloid);

          done(err);
        });
      });

      it('publishes tabloid', (done) => {
        subject(aTabloid, (err) => {
          expect(hexo.publish).to.have.been.calledWith(aTabloid);

          done(err);
        });
      });

      it('enriches tabloid with news', (done) => {
        subject(aTabloid, (err) => {
          expect(aTabloid.news).to.equal(newsList);

          done(err);
        });
      });

      it('republishes tabloid news', (done) => {
        subject(aTabloid, (err) => {
          expect(hexo.publish).to.have.been.calledWith(newsList[0]);
          expect(tabloids.findTabloid).to.have.been.calledWith(newsList[0]);

          done(err);
        });
      });
    });

    describe('when is a tabloid news', () => {
      given('tabloidNews', () => new News(tabloidNewsFactory.build({
        status: 'draft',
        region: 'tabloid_mg'
      })));
      given('aTabloid', () => new News(tabloidFactory.build()));

      beforeEach(() => {
        sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
      });

      it('publishes news', (done) => {
        subject(tabloidNews, (err) => {
          expect(hexo.publish).to.have.been.calledWith(tabloidNews);

          done(err);
        });
      });

      it('updates regional list', function(done){
        subject(tabloidNews, function(err) {
          expect(hexo.publishList).to.have.been.calledWithMatch({
            layout: 'news_list',
            area: tabloidNews.region
          });

          done(err);
        });
      });

      it('searches tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(tabloids.findTabloid).to.have.been.calledWith(tabloidNews);

          done(err);
        });
      });

      it('publishes tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(hexo.publish).to.have.been.calledWith(
            sandbox.match({edition: aTabloid.edition})
          );

          done(err);
        });
      });

      describe('when there is no tabloid', function() {
        given('aTabloid', () => undefined);

        beforeEach(() => {
          tabloids.findTabloid.restore();
          sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
        });

        it('does not publishes tabloid', (done) => {
          subject(tabloidNews, (err) => {
            expect(hexo.publish).to.not.have.been.calledWith(aTabloid);

            done(err);
          });
        });
      });
    });

    describe('when is a photo_caption', () => {
      given('photoCaption', () => new News(photoCaptionFactory.build({
        status: 'draft'
      })));

      given('list', () => [
        photoCaptionFactory.build({metadata: metadataFactory.build({url: 'url'})}
      )]);

      beforeEach(() => {
        sandbox.stub(photoCaptions, 'getRelateds').yields(null, list);
      });

      it('searches relateds', (done) => {
        subject(photoCaption, (err) => {
          expect(photoCaptions.getRelateds).to.have.been.calledWith(photoCaption);

          done(err);
        });
      });

      it('sets related_photo_captions', (done) => {
        subject(photoCaption, (err) => {
          expect(photoCaption.related_photo_captions).to.eql(list);

          done(err);
        });
      });

      describe('republishes photo-caption list', () => {
        beforeEach(() => {
          sandbox.stub(photoCaptions, 'getList').yields(null, list);
        });

        it('searches list', (done) => {
          subject(photoCaption, (err) => {
            expect(photoCaptions.getList).to.have.been.called;

            done(err);
          });
        });

        it('publishes list', (done) => {
          subject(photoCaption, (err) => {
            expect(hexo.publishList).to.have.been.calledWith({
              layout: 'photo_caption_list',
              path: 'charges',
              news: list
            });

            done(err);
          });
        });
      });
    });
  });

  describe('.remove', function() {
    it('exists', () => {
      expect(publisher.remove).to.exist;
    });

    describe('when news status is not "draft"', function () {
      given('news', () => new News(newsFactory.build({status: 'published'})));

      beforeEach(function(){
        sandbox.stub(news, 'save').yields(null);
      });

      it('status was not changed to "deleted"', (done) => {
        publisher.remove(news, (err) => {
          expect(news.status).to.not.equal('deleted');

          done(err);
        });
      });

      it('news was not saved in dataBase', (done) => {
        publisher.remove(news, (err) => {
          expect(news.save).to.not.have.been.called;

          done(err);
        });
      });
    });

    describe('when status is "draft"', function () {
      given('news', () => new News(newsFactory.build({status: 'draft'})));

      beforeEach(function(){
        sandbox.stub(news, 'save').yields(null);
      });

      it('news status was changed to "deleted"', (done) => {
        publisher.remove(news, (err) => {
          expect(news.status).to.equal('deleted');

          done(err);
        });
      });

      it('news was saved in dataBase', (done) => {
        publisher.remove(news, (err) => {
          expect(news.save).to.have.been.called;

          done(err);
        });
      });
    });
  });

  describe('.unpublish', function() {
    var subject = function(news, callback) { publisher.unpublish(news, callback); };

    var metadata = metadataFactory.build({ url: '/2017/03/03/bla-bla/' });
    given('news', () => new News(newsFactory.build({metadata: metadata, status: 'published' })));
    given('updatedNews', () => Object.assign({status: 'draft'}, news));
    given('bdf', () => new Home({name: 'bdf'}));
    given('radioAgencia', () => new Home({name: 'radio_agencia'}));

    beforeEach(function() {
      sandbox.stub(news, 'save').yields(null, updatedNews);
      sandbox.stub(site, 'remove').yields(null);
      sandbox.stub(hexo, 'publishList').yields(null);
      sandbox.stub(publisher, 'publishHome').yields(null);

      var stub = sandbox.stub(Home, 'findByName');
      stub.withArgs('bdf').yields(null, bdf);
      stub.withArgs('radio_agencia').yields(null, radioAgencia);
    });

    it('exists', function() {
      expect(publisher.unpublish).to.exist;
    });

    it('returns updated news', function(done) {
      subject(news, function(err, news) {
        expect(news.status).to.equal('draft');

        done(err);
      });
    });

    it('saves changes', function(done) {
      subject(news, function(err) {
        expect(news.save).to.have.been.called;

        done(err);
      });
    });

    it('delegates to site', function(done) {
      subject(news, function(err, news) {
        expect(site.remove).to.have.been.calledWith(news.metadata.url);

        done(err);
      });
    });

    it('updates area', function(done) {
      subject(news, function(err, news) {
        expect(hexo.publishList).to.have.been.calledWith({
          layout: 'news_list',
          path: news.metadata.area,
          area: news.metadata.area,
          news: []
        });

        done(err);
      });
    });

    it('updates last news', function(done) {
      subject(news, function(err, _news) {
        expect(hexo.publishList).to.have.been.calledWith({
          layout: 'news_list',
          area: 'ultimas_noticias',
          path: 'ultimas_noticias',
          news: []
        });

        done(err);
      });
    });

    it('publishes bdf home', (done) => {
      subject(news, function(err) {
        expect(publisher.publishHome).to.have.been.calledWith(bdf);

        done(err);
      });
    });

    it('publishes radio_agencia home', (done) => {
      subject(news, function(err) {
        expect(publisher.publishHome).to.have.been.calledWith(radioAgencia);

        done(err);
      });
    });

    describe('when is a tabloid news', () => {
      given('tabloidNews', () => new News(tabloidNewsFactory.build()));
      given('aTabloid', () => new News(tabloidFactory.build()));

      beforeEach(() => {
        sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
        sandbox.stub(hexo, 'publish').yields(null);
      });

      it('searches tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(tabloids.findTabloid).to.have.been.calledWith(tabloidNews);

          done(err);
        });
      });

      it('publishes tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(hexo.publish).to.have.been.calledWith(aTabloid);

          done(err);
        });
      });

      it('updates region', function(done) {
        subject(tabloidNews, function(err) {
          expect(hexo.publishList).to.have.been.calledWithMatch({
            layout: 'news_list',
            area: 'tabloid_mg'
          });

          done(err);
        });
      });

      describe('when there is no tabloid', function() {
        given('aTabloid', () => undefined);

        beforeEach(() => {
          tabloids.findTabloid.restore();
          sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
        });

        it('does not publishes tabloid', (done) => {
          subject(tabloidNews, (err) => {
            expect(hexo.publish).to.not.have.been.calledWith(aTabloid);

            done(err);
          });
        });
      });
    });

    describe('and the area is "radioagencia"', function() {
      beforeEach(function() {
        news.metadata.area = 'radioagencia';
      });

      it('does not update area data file', function(done){
        subject(news, function(err) {
          expect(hexo.publishList).to.not.have.been.calledWithMatch({
            area: 'radioagencia',
          });

          done(err);
        });
      });

      describe('and it is a service', function() {
        var behaveAsService = function(tag, path) {
          beforeEach(function() {
            news.tags = [tag];
          });

          it('updates area', function(done){
            subject(news, function(err) {
              expect(hexo.publishList).to.have.been.calledWith({
                layout: 'news_list',
                area: tag,
                path: `radioagencia/${path}`,
                news: []
              });

              done(err);
            });
          });
        };

        describe('hoje na historia', () => {
          behaveAsService('hojenahistoria', 'hoje-na-historia');
        });

        describe('alimento e saude', () => {
          behaveAsService('alimentoesaude', 'alimento-e-saude');
        });

        describe('nossos direitos', () => {
          behaveAsService('nossosdireitos', 'nossos-direitos');
        });

        describe('fatos curiosos', () => {
          behaveAsService('fatoscuriosos', 'fatos-curiosos');
        });

        describe('mosaico cultural', () => {
          behaveAsService('mosaicocultural', 'mosaico-cultural');
        });
      });
    });
  });

  describe('publishHome', () => {
    var subject = (callback) => publisher.publishHome(home, false, callback);

    given('home', () => new Home({name: 'bdf'}));

    beforeEach(() => {
      sandbox.spy(home, 'populateAllFields');
      sandbox.stub(hexo, 'publishHome').yields(null);
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('populates news', (done) => {
      subject((err) => {
        expect(home.populateAllFields).to.have.been.called;
        done(err);
      });
    });

    it('delegates to hexo', (done) => {
      subject((err) => {
        expect(hexo.publishHome).to.have.been.calledWith(home);
        done(err);
      });
    });

    describe('when is radioagencia', () => {
      given('newsList', () => newsFactory.buildList(2));
      given('home', () => new Home({
        name: 'radio_agencia',
        featured_01: new News(newsFactory.build()),
        service_01: new News(newsFactory.build()),
        service_02: new News(newsFactory.build()),
        service_03: new News(newsFactory.build()),
        service_04: new News(newsFactory.build()),
        service_05: new News(newsFactory.build())
      }));

      beforeEach(() => {
        sandbox.stub(Home.prototype, 'populateAllFields').yields(null);
        sandbox.stub(News, 'find').yields(null, newsList);
      });

      it('enriches home with latest radioagencia news', (done) => {
        subject((err) => {
          expect(home.latest_news).to.equal(newsList);
          done(err);
        });
      });
    });

    describe('when is bdf', () => {
      given('newsList', () => newsFactory.buildList(2));
      given('home', () => new Home({name: 'bdf'}));

      beforeEach(() => {
        sandbox.stub(bdf, 'getLastNews').yields(null, newsList);
        sandbox.stub(bdf, 'getMostRead').yields(null, newsList);
      });

      it('enriches with latest news', (done) => {
        subject((err) => {
          expect(home.last_news).to.equal(newsList);
          done(err);
        });
      });

      it('enriches with most_read', (done) => {
        subject((err) => {
          expect(home.most_read).to.equal(newsList);
          done(err);
        });
      });
    });
  });
});

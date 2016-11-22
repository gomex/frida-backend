/*eslint no-undef: "off"*/
'use strict';

var _ = require('lodash');
var publisher = require('../../../../lib/models/publisher');
var News = require('../../../../lib/models/news');
var Home = require('../../../../lib/models/home');
var tabloids = require('../../../../lib/models/news/tabloids');
var advertisings = require('../../../../lib/models/news/advertisings');
var photoCaptions = require('../../../../lib/models/news/photo-captions');
var bdf = require('../../../../lib/models/home/bdf');
var hexo = require('../../../../lib/publisher/hexo');
var newsFactory = require('../../../factories/news-attributes').news;
var metadataFactory = require('../../../factories/news-attributes').metadata;
var tabloidFactory = require('../../../factories/tabloid-attributes').tabloid;
var tabloidNewsFactory = require('../../../factories/tabloid-news-attributes').tabloid;
var photoCaptionFactory = require('../../../factories/photo-caption-attributes').photoCaption;
var advertisingFactory = require('../../../factories/advertising-attributes').advertising;

describe('publisher', function() {
  describe('.publish', function() {
    var subject = function(news, callback) { publisher.publish(news, callback); };

    describe('when news is not published', function() {
      var metadata = metadataFactory.build();
      given('news', () => new News(newsFactory.build(
        {
          metadata: metadata,
          published_at: new Date(),
          updated_at: new Date(),
          status: 'draft'
        }
      )));

      beforeEach(function() {
        sandbox.stub(news, 'save').yields(null);
        sandbox.stub(hexo, 'publish').yields(null);
        sandbox.stub(hexo, 'updateAreaPage').yields(null);
        sandbox.stub(hexo, 'updateHomePage').yields(null);
        sandbox.stub(hexo, 'publishStaticFiles').yields(null);
      });

      describe('and the area is "nenhuma"', function() {

        beforeEach(function() {
          news.metadata.area = 'nenhuma';
        });

        it('does not update area data file', function(done){
          subject(news, function(err) {
            expect(hexo.updateAreaPage).to.not.have.been.calledWith('nenhuma');

            done(err);
          });
        });
      });

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
          expect(hexo.updateAreaPage).to.have.been.called;

          done(err);
        });
      });

      it('updates last news data file', function(done){
        subject(news, function(err) {
          expect(hexo.updateAreaPage).to.have.been.calledWith('ultimas_noticias');

          done(err);
        });
      });

      it('updates radio area data file', function(done){
        subject(news, function(err) {
          expect(hexo.updateAreaPage).to.have.been.calledWith('radio');

          done(err);
        });
      });

      context('when TOGGLE_uOPfBeRx_HOME_EDIT is disabled', () => {
        beforeEach(() => {
          process.env.TOGGLE_uOPfBeRx_HOME_EDIT = false;
        });

        it('updates home data file', function(done){
          subject(news, function(err) {
            expect(hexo.updateHomePage).to.have.been.called;

            done(err);
          });
        });
      });

      it('sets url', function(done) {
        subject(news, function(err, publishedNews) {
          expect(publishedNews.metadata.url).to.exist;

          done(err);
        });
      });

      it('creates static files', function(done){
        subject(news, function(err) {
          expect(hexo.publishStaticFiles).to.have.been.called;

          done(err);
        });
      });
    });

    describe('when news is already published', function() {
      beforeEach(function() {
        sandbox.stub(hexo, 'publish').yields(null);
        sandbox.stub(hexo, 'updateAreaPage').yields(null);
        sandbox.stub(hexo, 'updateHomePage').yields(null);
      });

      describe('and is modified', function() {
        var metadata = metadataFactory.build({ url: '/2016/05/21/what' });
        given('news', () => new News(newsFactory.build({
          metadata: metadata,
          published_at: new Date(1000),
          updated_at: new Date(),
          status: 'published'
        })));

        beforeEach(function() {
          sandbox.stub(news, 'save').yields(null);
        });

        it('does not change original published_at date', function(done) {
          subject(_.clone(news), function(err, publishedNews) {
            expect(publishedNews.published_at).to.be.equal(news.published_at);

            done(err);
          });
        });

        it('does not change url if title changes', function(done) {
          var oldUrl = news.metadata.url;
          news.metadata.title = 'different title';

          subject(news, function(err, publishedNews) {
            expect(publishedNews.metadata.url).to.be.equal(oldUrl);

            done(err);
          });
        });
      });

      describe('and is not modified', function() {
        var metadata = metadataFactory.build();
        given('news', () => new News(newsFactory.build({
          metadata: metadata,
          published_at: new Date(),
          updated_at: new Date(1000)
        })));

        beforeEach(function() {
          sandbox.stub(news, 'save').yields(null);
        });

        it('does not update status on database', function(done){
          subject(news, function(err) {
            expect(news.save).to.not.have.been.called;

            done(err);
          });
        });

        it('does not create news data file', function(done){
          subject(news, function(err) {
            expect(hexo.publish).to.not.have.been.called;

            done(err);
          });
        });

        it('does not update area data file', function(done){
          subject(news, function(err) {
            expect(hexo.updateAreaPage).to.not.have.been.called;

            done(err);
          });
        });

        it('does not update last news data file', function(done){
          subject(news, function(err) {
            expect(hexo.updateAreaPage).to.not.have.been.called;

            done(err);
          });
        });

        it('does not update home data file', function(done){
          subject(news, function(err) {
            expect(hexo.updateHomePage).to.not.have.been.called;

            done(err);
          });
        });
      });
    });

    describe('when is a tabloid', () => {
      given('aTabloid', () => new News(tabloidFactory.build({
        status: 'draft'
      })));
      given('newsList', () => newsFactory.buildList(2));

      beforeEach(() => {
        sandbox.stub(tabloids, 'findNews').yields(null, newsList);
        sandbox.stub(hexo, 'publish').yields(null);
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
    });

    describe('when is a tabloid news', () => {
      given('tabloidNews', () => new News(tabloidNewsFactory.build({
        status: 'draft'
      })));
      given('aTabloid', () => new News(tabloidFactory.build()));

      beforeEach(() => {
        sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
        sandbox.stub(hexo, 'publish').yields(null);
      });

      it('publishes news', (done) => {
        subject(tabloidNews, (err) => {
          expect(hexo.publish).to.have.been.calledWith(tabloidNews);

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
          sandbox.stub(hexo, 'publishList').yields(null);
        });

        it('searches list', (done) => {
          subject(photoCaption, (err) => {
            expect(photoCaptions.getList).to.have.been.called;

            done(err);
          });
        });

        it('publishes list', (done) => {
          subject(photoCaption, (err) => {
            expect(hexo.publishList).to.have.been.calledWith(list);

            done(err);
          });
        });
      });
    });

    describe('when is an advertisement', () => {
      given('news', () => new News(advertisingFactory.build({
        status: 'draft'
      })));

      given('advertisingList', () => advertisingFactory.buildList(2));

      beforeEach(() => {
        sandbox.stub(advertisings, 'getList').yields(null, advertisingList);
        sandbox.stub(hexo, 'updateAdvertisingData').yields(null);
      });

      it('queries list', function(done){
        subject(news, function(err) {
          expect(advertisings.getList).to.have.been.called;
          done(err);
        });
      });

      it('updates advertising data file', function(done){
        subject(news, function(err) {
          expect(hexo.updateAdvertisingData).to.have.been.calledWith(advertisingList);
          done(err);
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

    given('news', () => new News(newsFactory.build({ status: 'published' })));
    given('updatedNews', () => Object.assign({status: 'draft'}, news));

    beforeEach(function() {
      sandbox.stub(news, 'save').yields(null, updatedNews);
      sandbox.stub(hexo, 'unpublish').yields(null);
      sandbox.stub(hexo, 'updateAreaPage').yields(null);
      sandbox.stub(hexo, 'updateHomePage').yields(null);
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

    it('delegates to hexo', function(done) {
      subject(news, function(err, news) {
        expect(hexo.unpublish).to.have.been.calledWith(news);

        done(err);
      });
    });

    it('updates area', function(done) {
      subject(news, function(err, news) {
        expect(hexo.updateAreaPage).to.have.been.calledWith(news.metadata.area);

        done(err);
      });
    });

    it('updates last news', function(done) {
      subject(news, function(err, _news) {
        expect(hexo.updateAreaPage).to.have.been.calledWith('ultimas_noticias');

        done(err);
      });
    });

    it('updates radio area data file', function(done){
      subject(news, function(err) {
        expect(hexo.updateAreaPage).to.have.been.calledWith('radio');

        done(err);
      });
    });

    context('when TOGGLE_uOPfBeRx_HOME_EDIT is disabled', () => {
      beforeEach(() => {
        process.env.TOGGLE_uOPfBeRx_HOME_EDIT = false;
      });

      it('updates home page', function(done) {
        subject(news, function(err, _news) {
          expect(hexo.updateHomePage).to.have.been.called;

          done(err);
        });
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

    describe('when is an advertisement', () => {
      given('news', () => new News(advertisingFactory.build({
        status: 'draft'
      })));

      given('advertisingList', () => advertisingFactory.buildList(2));

      beforeEach(() => {
        sandbox.stub(advertisings, 'getList').yields(null, advertisingList);
        sandbox.stub(hexo, 'updateAdvertisingData').yields(null);
      });

      it('queries list', function(done){
        subject(news, function(err) {
          expect(advertisings.getList).to.have.been.called;
          done(err);
        });
      });

      it('updates advertising data file', function(done){
        subject(news, function(err) {
          expect(hexo.updateAdvertisingData).to.have.been.calledWith(advertisingList);
          done(err);
        });
      });
    });
  });

  describe('publishHome', () => {
    var subject = (callback) => publisher.publishHome(home, callback);

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
      given('home', () => new Home({ name: 'radio_agencia', featured_01: new News(newsFactory.build()) }));

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

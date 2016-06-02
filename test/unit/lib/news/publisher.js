'use strict';

var _ = require('lodash');
var publisher = require('../../../../lib/news/publisher');
var repository = require('../../../../lib/news/news-repository');
var tabloids = require('../../../../lib/news/tabloids');
var hexo = require('../../../../lib/publisher/hexo');
var newsFactory = require('../../../factories/news-attribute').newsAttribute;
var metadataFactory = require('../../../factories/news-attribute').metadata;
var tabloidFactory = require('../../../factories/tabloid-attributes').tabloidAttributes;

describe('publisher', function() {
  describe('.publish', function() {
    var subject = function(news, callback) { publisher.publish(news, callback); };

    describe('when news is not published', function() {
      var metadata = metadataFactory.build();
      var news = newsFactory.build(
        {
          metadata: metadata,
          published_at: new Date(),
          updated_at: new Date(),
          status: 'draft'
        });

      beforeEach(function() {
        sandbox.stub(repository, 'updateById').yields(null, news);
        sandbox.stub(hexo, 'publish').yields(null);
        sandbox.stub(hexo, 'updateAreaPage').yields(null);
        sandbox.stub(hexo, 'updateHomePage').yields(null);
      });

      it('updates status on database', function(done){
        subject(news, function(err) {
          expect(repository.updateById).to.have.been.called;

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

      it('updates home data file', function(done){
        subject(news, function(err) {
          expect(hexo.updateHomePage).to.have.been.called;

          done(err);
        });
      });

      it('sets url', function(done) {
        subject(news, function(err, publishedNews) {
          expect(publishedNews.metadata.url).to.exist;

          done(err);
        });
      });
    });

    describe('when news is already published', function() {
      beforeEach(function() {
        sandbox.stub(repository, 'updateById').yields(null, null);
        sandbox.stub(hexo, 'publish').yields(null);
        sandbox.stub(hexo, 'updateAreaPage').yields(null);
        sandbox.stub(hexo, 'updateHomePage').yields(null);
      });

      describe('and is modified', function() {
        var metadata = metadataFactory.build({ url: '/2016/05/21/what' });
        var news = newsFactory.build(
          {
            metadata: metadata,
            published_at: new Date(1000),
            updated_at: new Date(),
            status: 'published'
          });

        it('does not change original published_at date', function(done) {
          subject(_.clone(news), function(err, publishedNews) {
            expect(publishedNews.published_at).to.be.equal(news.published_at);

            done(err);
          });
        });

        it('does not change original url if title changes', function(done) {
          var toPublish = _.cloneDeep(news);
          toPublish.metadata.title = 'different title';

          subject(toPublish, function(err, publishedNews) {
            expect(publishedNews.metadata.url).to.be.equal(news.metadata.url);

            done(err);
          });
        });
      });

      describe('and is not modified', function() {
        var metadata = metadataFactory.build();
        var news = newsFactory.build(
          {
            metadata: metadata,
            published_at: new Date(),
            updated_at: new Date(1000)
          });

        it('does not update status on database', function(done){
          subject(news, function(err) {
            expect(repository.updateById).to.not.have.been.called;

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

        it('does not update home data file', function(done){
          subject(news, function(err) {
            expect(hexo.updateHomePage).to.not.have.been.called;

            done(err);
          });
        });
      });
    });

    describe('when is a tabloid', () => {
      var aTabloid = tabloidFactory.build();
      var newsList = newsFactory.buildList(2);

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
          expect(hexo.publish).to.have.been.called;

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
  });

  describe('.unpublish', function() {
    var subject = function(callback) { publisher.unpublish(news, callback); };

    var news = newsFactory.build({ status: 'published' });

    var updatedNews = _.clone(news);
    updatedNews.status = 'draft';

    beforeEach(function() {
      sandbox.stub(repository, 'updateById').yields(null, updatedNews);
      sandbox.stub(hexo, 'unpublish').yields(null);
      sandbox.stub(hexo, 'updateAreaPage').yields(null);
      sandbox.stub(hexo, 'updateHomePage').yields(null);
    });

    it('exists', function() {
      expect(publisher.unpublish).to.exist;
    });

    it('returns updated news', function(done) {
      subject(function(err, news) {
        expect(news.status).to.equal('draft');

        done(err);
      });
    });

    it('saves changes', function(done) {
      subject(function(err, news) {
        expect(repository.updateById).to.have.been.calledWith(news._id, news);

        done(err);
      });
    });

    it('delegates to hexo', function(done) {
      subject(function(err, news) {
        expect(hexo.unpublish).to.have.been.calledWith(news);

        done(err);
      });
    });

    it('updates area', function(done) {
      subject(function(err, news) {
        expect(hexo.updateAreaPage).to.have.been.calledWith(news.metadata.area);

        done(err);
      });
    });

    it('updates home page', function(done) {
      subject(function(err, _news) {
        expect(hexo.updateHomePage).to.have.been.called;

        done(err);
      });
    });
  });
});

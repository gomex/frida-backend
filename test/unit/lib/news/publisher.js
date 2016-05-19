'use strict';

var chai = require('chai');
var expect = require('chai').expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var publisher = require('../../../../lib/news/publisher');
var repository = require('../../../../lib/news/news-repository');
var hexo = require('../../../../lib/publisher/hexo');
var newsFactory = require('../../../factories/news-attribute').newsAttribute;
var metadataFactory = require('../../../factories/news-attribute').metadata;

chai.use(sinonChai);

describe('publisher', function() {

  describe('.publish', function() {
    var subject = function(news, callback) { publisher.publish(news, callback); };

    describe('when news is already published', function() {
      beforeEach(function() {
        sinon.stub(repository, 'updateById').yields(null, null);
        sinon.stub(hexo, 'publish').yields(null);
        sinon.stub(hexo, 'updateAreaPage').yields(null);
        sinon.stub(hexo, 'updateHomePage').yields(null);
      });

      afterEach(function() {
        repository.updateById.restore();
        hexo.publish.restore();
        hexo.updateAreaPage.restore();
        hexo.updateHomePage.restore();
      });

      describe('and was not modified', function() {
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

  });

  describe('.unpublish', function() {
    var subject = function(callback) { publisher.unpublish(news, callback); };

    var news = {
      _id: '123',
      status: 'published',
      metadata: {
        layout: 'post',
        area: 'area'
      }
    };

    var updatedNews = {
      _id: news._id,
      status: 'draft',
      metadata: news.metadata
    };

    beforeEach(function() {
      sinon.stub(repository, 'updateById').yields(null, updatedNews);
      sinon.stub(hexo, 'unpublish').yields(null);
      sinon.stub(hexo, 'updateAreaPage').yields(null);
      sinon.stub(hexo, 'updateHomePage').yields(null);
    });

    afterEach(function() {
      repository.updateById.restore();
      hexo.unpublish.restore();
      hexo.updateAreaPage.restore();
      hexo.updateHomePage.restore();
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

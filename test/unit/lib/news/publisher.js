'use strict';

var chai = require('chai');
var expect = require('chai').expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var publisher = require('../../../../lib/news/publisher');
var repository = require('../../../../lib/news/news-repository');

chai.use(sinonChai);

describe('publisher', function() {
  describe('.unpublish', function() {
    var subject = function(callback) { return publisher.unpublish(news, callback); };

    var news = {id: '123', status: 'published'};
    var updatedNews = {id: news.id, status: 'draft'};

    beforeEach(function() {
      sinon.stub(repository, 'updateById', function(id, news, callback) {
        callback(null, updatedNews);
      });
    });

    afterEach(function() {
      repository.updateById.restore();
    });

    it('exists', function() {
      expect(publisher.unpublish).to.exist;
    });

    it('returns updated news', function(done) {
      subject(function(err, news) {
        done(err);

        expect(news.status).to.equal('draft');
      });
    });

    it('saves changes', function(done) {
      subject(function(err, news) {
        done(err);

        expect(repository.updateById).to.have.been.calledWith(news.id, news);
      });
    });
  });
});

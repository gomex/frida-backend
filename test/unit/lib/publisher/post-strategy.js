'use strict';

var _           = require('underscore');

var metadataFactory         = require('../../../factories/news-attributes').metadata;
var newsFactory             = require('../../../factories/news-attributes').news;
var columnMetadataFactory   = require('../../../factories/column-attributes').metadata;
var columnFactory           = require('../../../factories/column-attributes').column;

var postStrategy = require('../../../../lib/publisher/post-strategy');
var News = require('../../../../lib/models/news');

describe('post-strategy', function() {

  describe('when area is not column', function() {

    describe('buildOtherNewsData', function() {
      var lastNews;

      beforeEach(function(done) {
        lastNews = [];
        for(var i = 0; i < 20; i++) {
          var metadata = metadataFactory.build({ url: '2016/03/news-' + Date.now() });
          var news = newsFactory.build({ metadata: metadata, published_at: new Date(), updated_at: new Date(), status: 'published' });
          lastNews.push(news);
        }

        News.create(lastNews, done);
      });

      it('returns a non-empty Array', function(done) {
        var news = _.last(lastNews);

        postStrategy.buildOtherNewsData(news, function(err, otherNewsData) {
          if(err) return done(err);

          expect(otherNewsData).to.be.instanceof(Array);
          expect(otherNewsData).to.have.length.above(0);

          done();
        });
      });
    });
  });

  describe('when area is column', function() {

    describe('buildOtherNewsData', function() {
      var lastColumns;

      beforeEach(function(done) {
        lastColumns = [];
        for(var i = 0; i < 20; i++) {
          var columnMetadata = columnMetadataFactory.build({ url: '2016/03/column-' + Date.now() });
          var column = columnFactory.build({ metadata: columnMetadata, published_at: new Date(), status: 'published' });
          lastColumns.push(column);
        }

        News.create(lastColumns, done);
      });

      it('returns an empty Array', function(done) {
        var col = _.last(lastColumns);

        postStrategy.buildOtherNewsData(col, function(err, otherNewsData) {
          if(err) return done(err);

          expect(otherNewsData).to.be.instanceof(Array);
          expect(otherNewsData).to.be.empty;

          done();
        });
      });
    });
  });
});

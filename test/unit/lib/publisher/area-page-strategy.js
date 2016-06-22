'use strict';

var _           = require('underscore');

var metadataFactory         = require('../../../factories/news-attributes').metadata;
var newsFactory             = require('../../../factories/news-attributes').news;
var columnMetadataFactory   = require('../../../factories/column-attributes').metadata;
var columnFactory           = require('../../../factories/column-attributes').column;

var areaPageStrategy    = require('../../../../lib/publisher/area-page-strategy');
var News      = require('../../../../lib/models/news');

describe('area-page-strategy', function() {

  describe('buildPageData', function() {

    describe('when area is not column', function() {
      var lastNews;

      beforeEach(function(done) {
        var metadata = metadataFactory.build({ url: '2016/03/news-' + Date.now() });
        var news = newsFactory.build({ metadata: metadata, published_at: new Date(), status: 'published' });
        lastNews = [];
        for(var i = 0; i < 20; i++) {
          lastNews.push(news);
        }

        News.create(lastNews, done);
      });

      it('area page data has layout "news_list" and a simplified version of the last 20 published news for the area', function(done) {
        var news = _.last(lastNews);

        areaPageStrategy.buildPageData(news.metadata.area, function(err, areaPageData) {
          if(err) return done(err);

          var simplifiedNews = _.map(lastNews, function(item) {
            return {
              cover: {
                url: item.metadata.cover.link,
                small: item.metadata.cover.small,
                medium: item.metadata.cover.medium,
                credits: item.metadata.cover.credits,
                subtitle: item.metadata.cover.subtitle
              },
              title: item.metadata.title,
              description: item.metadata.description,
              path: item.metadata.url,
              date: item.published_at
            };
          });

          expect(areaPageData.layout).to.equal('news_list');
          expect(areaPageData.area).to.equal(news.metadata.area);
          expect(areaPageData.news).to.eql(simplifiedNews);

          done();
        });
      });

      it('last news page data has layout "news_list" and a simplified version of the last 20 published news for any area', function(done) {

        areaPageStrategy.buildPageData('ultimas_noticias', function(err, areaPageData) {
          if(err) return done(err);

          var simplifiedNews = _.map(lastNews, function(item) {
            return {
              cover: {
                url: item.metadata.cover.link,
                small: item.metadata.cover.small,
                medium: item.metadata.cover.medium,
                credits: item.metadata.cover.credits,
                subtitle: item.metadata.cover.subtitle
              },
              title: item.metadata.title,
              description: item.metadata.description,
              path: item.metadata.url,
              date: item.published_at
            };
          });

          expect(areaPageData.layout).to.equal('news_list');
          expect(areaPageData.area).to.equal('últimas notícias');
          expect(areaPageData.news).to.eql(simplifiedNews);

          done();
        });
      });

      describe('area field is a readable version of the area identifier', function() {
        it('direitos_humanos becomes "direitos humanos"', function(done) {
          areaPageStrategy.buildPageData('direitos_humanos', function(err, areaPageData) {
            if(err) return done(err);

            expect(areaPageData.area).to.equal('direitos humanos');

            done();
          });
        });

        it('espanol becomes "español"', function(done) {
          areaPageStrategy.buildPageData('espanol', function(err, areaPageData) {
            if(err) return done(err);

            expect(areaPageData.area).to.equal('español');

            done();
          });
        });
      });
    });

    describe('when area is column', function() {
      var lastColumns = [];

      beforeEach(function(done) {

        var columnMetadata = columnMetadataFactory.build({ url: '2016/03/column-' + Date.now() });
        var column = columnFactory.build({ metadata: columnMetadata, published_at: new Date(), status: 'published' });
        for(var i = 0; i < 20; i++) {
          lastColumns.push(column);
        }

        News.create(lastColumns, done);
      });

      it('page data has layout "columnists" and a simplified version of the last 20 published columns', function(done) {

        areaPageStrategy.buildPageData('column', function(err, columnPageData) {
          if(err) return done(err);

          var simplifiedColumns = _.map(lastColumns, function(item) {
            return {
              columnist: item.metadata.columnist,
              title: item.metadata.title,
              description: item.metadata.description,
              path: item.metadata.url,
              date: item.published_at
            };
          });

          expect(columnPageData.layout).to.equal('columnists');
          expect(columnPageData.columns).to.eql(simplifiedColumns);

          done();
        });
      });

    });
  });
});

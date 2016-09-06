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
        var news = newsFactory.build({ metadata: metadata, published_at: new Date(), updated_at: new Date(), status: 'published' });
        lastNews = [];
        for(var i = 0; i < 20; i++) {
          lastNews.push(news);
        }

        News.create(lastNews, done);
      });

      it('area page data has at least one page of news for the area', function(done) {
        var news = _.last(lastNews);

        areaPageStrategy.buildPageData(news.metadata.area, function(err, areaPageData) {
          if(err) return done(err);

          expect(areaPageData).to.be.instanceof(Array);
          expect(areaPageData).to.have.length.above(0);

          done();
        });
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
              date: item.published_at,
              author: item.metadata.author,
              updated_at: item.updated_at
            };
          });

          expect(areaPageData[0].layout).to.equal('news_list');
          expect(areaPageData[0].area).to.equal(news.metadata.area);
          expect(areaPageData[0].news).to.eql(simplifiedNews);

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
              date: item.published_at,
              author: item.metadata.author,
              updated_at: item.updated_at
            };
          });

          expect(areaPageData[0].layout).to.equal('news_list');
          expect(areaPageData[0].area).to.equal('últimas notícias');
          expect(areaPageData[0].news).to.eql(simplifiedNews);

          done();
        });
      });

      describe('when there\'s no news tagged with radio', function() {
        it('radio page data has layout "news_list", but no data', function(done) {

          areaPageStrategy.buildPageData('radio', function(err, areaPageData) {
            if(err) return done(err);

            expect(areaPageData[0].layout).to.equal('news_list');
            expect(areaPageData[0].area).to.equal('rádio');
            expect(areaPageData[0].news).to.be.empty;

            done();
          });
        });
      });

      describe('when there\'s news tagged with radio', function() {
        var lastNews = [];

        beforeEach(function(done) {
          var metadata = metadataFactory.build({
            url: '2016/03/news-radio-' + Date.now(),
            tags: ['hex', 'durgs', 'rádio', 'rock n roll']
          });

          var news = newsFactory.build({
            metadata: metadata,
            published_at: new Date(),
            updated_at: new Date(),
            status: 'published'
          });

          lastNews = [];
          for(var i = 0; i < 20; i++) {
            lastNews.push(news);
          }
          News.create(lastNews, done);
        });

        it('radio page data has layout "news_list", and a simplified version of the last 20 published news tagged with radio', function(done) {

          areaPageStrategy.buildPageData('radio', function(err, areaPageData) {
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
                date: item.published_at,
                author: item.metadata.author,
                updated_at: item.updated_at
              };
            });

            expect(areaPageData[0].layout).to.equal('news_list');
            expect(areaPageData[0].area).to.equal('rádio');
            expect(areaPageData[0].news).to.eql(simplifiedNews);

            done();
          });
        });
      });

      describe('area field is a readable version of the area identifier', function() {
        it('direitos_humanos becomes "direitos humanos"', function(done) {
          areaPageStrategy.buildPageData('direitos_humanos', function(err, areaPageData) {
            if(err) return done(err);

            expect(areaPageData[0].area).to.equal('direitos humanos');

            done();
          });
        });

        it('espanol becomes "español"', function(done) {
          areaPageStrategy.buildPageData('espanol', function(err, areaPageData) {
            if(err) return done(err);

            expect(areaPageData[0].area).to.equal('español');

            done();
          });
        });
      });
    });

    describe('when area is column', function() {
      var lastColumns;

      beforeEach(function(done) {
        lastColumns = [];
        var columnMetadata = columnMetadataFactory.build({ url: '2016/03/column-' + Date.now() });
        var column = columnFactory.build({ metadata: columnMetadata, published_at: new Date(), status: 'published' });
        for(var i = 0; i < 20; i++) {
          lastColumns.push(column);
        }

        News.create(lastColumns, done);
      });

      it('page data has at least one page of columns', function(done) {

        areaPageStrategy.buildPageData('column', function(err, columnPageData) {
          if(err) return done(err);

          expect(columnPageData).to.be.instanceof(Array);
          expect(columnPageData).to.have.length.above(0);

          done();
        });
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

          expect(columnPageData[0].layout).to.equal('columnists');
          expect(columnPageData[0].columns).to.eql(simplifiedColumns);

          done();
        });
      });

    });
  });
});

'use strict';

var _           = require('underscore');

var metadataFactory         = require('../../../factories/news-attributes').metadata;
var newsFactory             = require('../../../factories/news-attributes').news;
var columnMetadataFactory   = require('../../../factories/column-attributes').metadata;
var columnFactory           = require('../../../factories/column-attributes').column;

var areaPageStrategy    = require('../../../../lib/publisher/area-page-strategy');
var News      = require('../../../../lib/news/news-repository').news;

describe('area-page-strategy', function() {

  describe('buildPageData', function() {

    describe('when area is not column', function() {
      var lastNews = [];

      before(function(done) {
        var metadata = metadataFactory.build({ url: '2016/03/news-' + Date.now() });
        var news = newsFactory.build({ metadata: metadata, published_at: new Date(), status: 'published' });
        for(var i = 0; i < 20; i++) {
          lastNews.push(news);
        }

        News.create(lastNews, done);
      });

      it('area page data has layout "news_list" and a simplified version of the last 20 published news for the area', function(done) {
        var news = _.last(lastNews);

        areaPageStrategy.buildPageData(news.metadata.area, function(err, areaPageData) {
          if(err) throw err;

          var simplifiedNews = _.map(lastNews, function(item) {
            return {
              cover: {
                url: item.metadata.cover.link,
                small: item.metadata.cover.small,
                medium: item.metadata.cover.medium,
                credits: item.metadata.cover.credits,
                subtitle: item.metadata.cover.subtitle
              },
              hat: item.metadata.hat,
              title: item.metadata.title,
              description: item.metadata.description,
              path: item.metadata.url,
              date: item.published_at
            };
          });

          assert.equal(areaPageData.layout, 'news_list');
          assert.equal(areaPageData.area, news.metadata.area);
          assert.deepEqual(areaPageData.news, simplifiedNews);

          done();
        });
      });

      describe('area field is a readable version of the area identifier', function() {
        it('direitos_humanos becomes "direitos humanos"', function(done) {
          areaPageStrategy.buildPageData('direitos_humanos', function(err, areaPageData) {
            if(err) throw err;

            assert.equal(areaPageData.area, 'direitos humanos');

            done();
          });
        });

        it('espanol becomes "español"', function(done) {
          areaPageStrategy.buildPageData('espanol', function(err, areaPageData) {
            if(err) throw err;

            assert.equal(areaPageData.area, 'español');

            done();
          });
        });
      });
    });

    describe('when area is column', function() {
      var lastColumns = [];

      before(function(done) {

        var columnMetadata = columnMetadataFactory.build({ url: '2016/03/column-' + Date.now() });
        var column = columnFactory.build({ metadata: columnMetadata, published_at: new Date(), status: 'published' });
        for(var i = 0; i < 20; i++) {
          lastColumns.push(column);
        }

        News.create(lastColumns, done);
      });

      it('page data has layout "columnists" and a simplified version of the last 20 published columns', function(done) {

        areaPageStrategy.buildPageData('column', function(err, columnPageData) {
          if(err) throw err;

          var simplifiedColumns = _.map(lastColumns, function(item) {
            return {
              columnist: item.metadata.columnist,
              title: item.metadata.title,
              description: item.metadata.description,
              path: item.metadata.url,
              date: item.published_at
            };
          });

          assert.equal(columnPageData.layout, 'columnists');
          assert.deepEqual(columnPageData.columns, simplifiedColumns);

          done();
        });
      });

    });
  });
});

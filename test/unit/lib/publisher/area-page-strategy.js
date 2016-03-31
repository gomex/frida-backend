'use strict';

var _           = require('underscore');
var async       = require('async');
var assert      = require('assert');

var metadataFactory         = require('../../../factories/news-attribute').metadata;
var newsFactory             = require('../../../factories/news-attribute').newsAttribute;
var columnMetadataFactory   = require('../../../factories/column-attributes').columnMetadata;
var columnFactory           = require('../../../factories/column-attributes').columnAttributes;

var areaPageStrategy    = require('../../../../lib/publisher/area-page-strategy');
var newsRepository      = require('../../../../lib/news/news-repository');

describe('area-page-strategy', function() {

  describe('buildPageData', function() {

    describe('when area is not column', function() {
      var lastNews = [];

      before(function(done) {
        var insertNewsOperations = [];

        var metadata = metadataFactory.build({ url: '2016/03/news-' + Date.now() });
        var news = newsFactory.build({ metadata: metadata, published_at: new Date(), status: 'published' });
        for(var i = 0; i < 20; i++) {
          insertNewsOperations.push(async.apply(newsRepository.insert, news));
          lastNews.push(news);
        }

        async.parallel(insertNewsOperations, function(err) {
          if(err) throw err;
          done();
        });
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

      it('replaces word separator from area name with spaces before setting area field', function(done) {
        areaPageStrategy.buildPageData('direitos_humanos_para_todos_os_humanos', function(err, areaPageData) {
          if(err) throw err;

          assert.equal(areaPageData.area, 'direitos humanos para todos os humanos');

          done();
        });
      });
    });

    describe('when area is column', function() {
      var lastColumns = [];

      before(function(done) {
        var insertColumnsOperations = [];

        var columnMetadata = columnMetadataFactory.build({ url: '2016/03/column-' + Date.now() });
        var column = columnFactory.build({ metadata: columnMetadata, published_at: new Date(), status: 'published' });
        for(var i = 0; i < 20; i++) {
          insertColumnsOperations.push(async.apply(newsRepository.insert, column));
          lastColumns.push(column);
        }

        async.parallel(insertColumnsOperations, function(err) {
          if(err) throw err;
          done();
        });
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

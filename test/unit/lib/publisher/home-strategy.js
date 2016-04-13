var _               = require('underscore');
var async           = require('async');
var assert          = require('assert');

var newsRepository  = require('../../../../lib/news/news-repository');
var homeStrategy    = require('../../../../lib/publisher/home-strategy');

var metadataFactory         = require('../../../factories/news-attribute').metadata;
var newsFactory             = require('../../../factories/news-attribute').newsAttribute;
var columnMetadataFactory   = require('../../../factories/column-attributes').columnMetadata;
var columnFactory           = require('../../../factories/column-attributes').columnAttributes;
var photoCaptionFactory     = require('../../../factories/photo-caption-attributes').photoCaptionAttributes;
var tabloidMetadataFactory  = require('../../../factories/tabloid-attributes').tabloidMetadata;
var tabloidFactory          = require('../../../factories/tabloid-attributes').tabloidAttributes;

describe('home-strategy', function() {

  describe('buildHome', function() {
    beforeEach(function(done){
      newsRepository.deleteAll(done);
    });

    function shouldHaveFeatured(sessionName) {
      it('sets ' + sessionName + ' to the most recent published news with display_area equals to "' + sessionName + '"', function(done){
        var metadata1 = metadataFactory.build({display_area: sessionName, url: '/2015/09/title-01'});
        var news1 = newsFactory.build({
          status: 'published',
          published_at: new Date(2015, 9, 22),
          metadata: metadata1
        });
        var metadata2 = metadataFactory.build({display_area: sessionName, url: '/2016/10/title-02'});
        var news2 = newsFactory.build({
          status: 'published',
          published_at: new Date(2016, 9, 22),
          metadata: metadata2
        });

        async.parallel([
          async.apply(newsRepository.insert, news1),
          async.apply(newsRepository.insert, news2)
        ], function(err, _insertedIds){
          if(err) throw err;

          homeStrategy.buildHome(function(err, newsForHome){
            if(err) throw err;

            var expected = {
              cover: {
                url: news2.metadata.cover.link,
                small: news2.metadata.cover.small,
                medium: news2.metadata.cover.medium,
                credits: news2.metadata.cover.credits,
                subtitle: news2.metadata.cover.subtitle
              },
              date: news2.published_at,
              description: news2.metadata.description,
              title: news2.metadata.title,
              path: news2.metadata.url,
              hat: news2.metadata.hat
            };

            assert.deepEqual(newsForHome[sessionName], expected);
            done();
          });
        });
      });
    }

    function shouldHaveTabloid(tabloidName, displayArea) {
      it('sets "' + tabloidName + '" to the most recent published tabloid for this region', function(done){
        var metadata1 = tabloidMetadataFactory.build({display_area: displayArea, url: '/2015/09/title-01'});
        var tabloid1 = tabloidFactory.build({
          status: 'published',
          published_at: new Date(2015, 9, 22),
          metadata: metadata1
        });
        var metadata2 = tabloidMetadataFactory.build({display_area: displayArea, url: '/2016/10/title-02'});
        var tabloid2 = tabloidFactory.build({
          status: 'published',
          published_at: new Date(2016, 9, 22),
          metadata: metadata2
        });

        async.parallel([
          async.apply(newsRepository.insert, tabloid1),
          async.apply(newsRepository.insert, tabloid2)
        ], function(err, _insertedIds){
          if(err) throw err;

          homeStrategy.buildHome(function(err, newsForHome){
            if(err) throw err;

            var expected = {
              cover: {
                url: tabloid2.metadata.cover.link,
                small: tabloid2.metadata.cover.small,
                medium: tabloid2.metadata.cover.medium,
                credits: tabloid2.metadata.cover.credits,
                subtitle: tabloid2.metadata.cover.subtitle
              },
              date: tabloid2.published_at,
              title: tabloid2.metadata.title,
              path: tabloid2.metadata.url
            };

            assert.deepEqual(newsForHome[tabloidName], expected);
            done();
          });
        });
      });
    }

    function shouldHaveColumn(sessionName) {
      it('sets ' + sessionName + ' to the most recent published column with display_area equals to "' + sessionName + '"', function(done){
        var metadata1 = columnMetadataFactory.build({
          display_area: sessionName,
          url: '/2015/09/title-01'
        });
        var column1 = columnFactory.build({
          status: 'published',
          published_at: new Date(2015, 9, 22),
          metadata: metadata1
        });
        var metadata2 = columnMetadataFactory.build({
          display_area: sessionName,
          url: '/2016/10/title-02'
        });
        var column2 = columnFactory.build({
          status: 'published',
          published_at: new Date(2016, 9, 22),
          metadata: metadata2
        });

        async.parallel([
          async.apply(newsRepository.insert, column1),
          async.apply(newsRepository.insert, column2)
        ], function(err, _insertedIds){
          if(err) throw err;

          homeStrategy.buildHome(function(err, newsForHome){
            if(err) throw err;

            var expected = {
              date: column2.published_at,
              columnist: column2.metadata.columnist,
              title: column2.metadata.title,
              path: column2.metadata.url
            };

            assert.deepEqual(newsForHome[sessionName], expected);
            done();
          });
        });
      });
    }

    it('sets layout to "national"', function(done){
      homeStrategy.buildHome(function(err, newsForHome){
        if(err) throw err;

        assert.equal(newsForHome.layout, 'national');
        done();
      });
    });

    it('sets last_news to the last five published news', function(done) {
      var news = newsFactory.build({ status: 'published', published_at: new Date() });
      news.metadata.url = '/2016/12/title/';

      async.parallel([
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news)
      ], function(err, _insertedIds){
        if(err) throw err;

        homeStrategy.buildHome(function(err, newsForHome){
          if(err) throw err;

          var expected = _.times(5, function(_index){
            return {
              cover: {
                url: news.metadata.cover.link,
                small: news.metadata.cover.small,
                medium: news.metadata.cover.medium,
                credits: news.metadata.cover.credits,
                subtitle: news.metadata.cover.subtitle
              },
              date: news.published_at,
              description: news.metadata.description,
              title: news.metadata.title,
              path: news.metadata.url,
              hat: news.metadata.hat
            };
          });

          assert.deepEqual(newsForHome.last_news, expected);
          done();
        });
      });
    });

    it('sets photo_caption to the last published news of type photo_caption', function(done) {
      var photoCaption1 = photoCaptionFactory.build({ status: 'published', published_at: new Date(2015, 9, 22) });
      photoCaption1.metadata.url = '/2015/10/title/';
      var photoCaption2 = photoCaptionFactory.build({ status: 'published', published_at: new Date(2016, 9, 22) });
      photoCaption2.metadata.url = '/2016/10/title/';

      async.parallel([
        async.apply(newsRepository.insert, photoCaption1),
        async.apply(newsRepository.insert, photoCaption2)
      ], function(err, _insertedIds){
        if(err) throw err;

        homeStrategy.buildHome(function(err, newsForHome){
          if(err) throw err;

          var expected =  {
            cover: {
              url: photoCaption2.metadata.cover.link,
              small: photoCaption2.metadata.cover.small,
              medium: photoCaption2.metadata.cover.medium,
              credits: photoCaption2.metadata.cover.credits,
              subtitle: photoCaption2.metadata.cover.subtitle
            },
            date: photoCaption2.published_at,
            title: photoCaption2.metadata.title,
            path: photoCaption2.metadata.url
          };

          assert.deepEqual(newsForHome.photo_caption, expected);
          done();
        });
      });
    });

    it('sets most_read to the five most recent news marked as most_read', function(done) {
      var news = newsFactory.build({ status: 'published', published_at: new Date()});
      news.metadata.url = '/2016/12/title/';
      news.metadata.most_read = true;

      async.parallel([
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news),
        async.apply(newsRepository.insert, news)
      ], function(err, _insertedIds){
        if(err) throw err;

        homeStrategy.buildHome(function(err, newsForHome){
          if(err) throw err;

          var expected = _.times(5, function(_index){
            return {
              cover: {
                url: news.metadata.cover.link,
                small: news.metadata.cover.small,
                medium: news.metadata.cover.medium,
                credits: news.metadata.cover.credits,
                subtitle: news.metadata.cover.subtitle
              },
              date: news.published_at,
              description: news.metadata.description,
              title: news.metadata.title,
              path: news.metadata.url,
              hat: news.metadata.hat
            };
          });

          assert.deepEqual(newsForHome.most_read, expected);
          done();
        });
      });
    });

    shouldHaveFeatured('featured_01');

    shouldHaveFeatured('featured_02');

    shouldHaveFeatured('featured_03');

    shouldHaveFeatured('featured_04');

    shouldHaveFeatured('featured_05');

    shouldHaveFeatured('featured_06');

    shouldHaveFeatured('featured_07');

    shouldHaveFeatured('featured_08');

    shouldHaveColumn('column_01');

    shouldHaveColumn('column_02');

    shouldHaveColumn('column_03');

    shouldHaveTabloid('rio_de_janeiro', 'tabloid_rj');

    shouldHaveTabloid('minas_gerais', 'tabloid_mg');

    shouldHaveTabloid('parana', 'tabloid_pr');

    it('does not add the field if there is no news for that session', function(done) {
      homeStrategy.buildHome(function(err, newsForHome){
        assert.deepEqual(newsForHome, { layout: 'national' });
        done();
      });
    });
  });

});

var _               = require('underscore');
var async           = require('async');
var assert          = require('assert');
var MongoClient     = require('mongodb').MongoClient;
var moment          = require('moment');

var newsRepository  = require('../../../../lib/news/news-repository');
var homeStrategy    = require('../../../../lib/publisher/home-strategy');

var metadataFactory         = require('../../../factories/news-attribute').metadata;
var newsFactory             = require('../../../factories/news-attribute').newsAttribute;
var columnMetadataFactory   = require('../../../factories/column-attributes').columnMetadata;
var columnFactory           = require('../../../factories/column-attributes').columnAttributes;

describe('home-strategy', function() {

  describe('buildHome', function(){
    before(function(done){
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

          homeStrategy.buildHome(function(newsForHome){
            var expected = {
              cover: {
                url: news2.metadata.cover.link,
                small: news2.metadata.cover.small,
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

          homeStrategy.buildHome(function(newsForHome){
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

    it('sets layout to "nacional"', function(done){
      homeStrategy.buildHome(function(newsForHome){
        assert.equal(newsForHome.layout, 'nacional');
        done();
      });
    });

    it('sets last_news to the last six published news', function(done) {
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

        homeStrategy.buildHome(function(newsForHome){
          var expected = _.times(6, function(_index){
            return {
              cover: {
                url: news.metadata.cover.link,
                small: news.metadata.cover.small,
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
  });

  describe('lastNews',function() {

    var nationalEdition = '[not-a-link]';

    beforeEach(function(done){
      MongoClient.connect(process.env.DATABASE_URL, function(err, db) {
        db.collection('news').drop();
        db.close();
        done();
      });
    });

    function baseNews(date) {
      var baseNews = {
        body: '<h1>the news content</h1>',
        status: 'published',
        metadata: {
          title: 'title-' + date,
          edition: nationalEdition,
          hat: 'Nacional',
          description: 'description',
          url: '2015/12/03/novo-site-do-brasil-de-fato-e-lancado/',
          cover: {
            link: '//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg',
            small: '//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg',
            credits: 'credits',
            subtitle: 'subtitle'
          }
        }
      };

      return baseNews;
    }

    function createNews(date) {
      var news = baseNews(date);
      news.metadata.layout = 'post';
      news.created_at = date;
      news.published_at = date;
      return news;
    }

    function createOpinion(date) {
      var opinion = baseNews(date);
      opinion.metadata.layout = 'opinion';
      opinion.metadata.columnist = 'wandecleya@gmail.com';
      opinion.created_at = date;
      opinion.published_at = date;
      return opinion;
    }


    function createNewsOfType(amount, type) {
      var news = [];
      var startTime = moment();

      var funciontToCall = type === 'post'? createNews : createOpinion;

      for(var i = 0; i < amount; i++) {
        var date = startTime.add(1, 'days').toISOString();
        news.push(funciontToCall(date));
      }

      return news;
    }

    function formatNewsAsExpectedBySite(items) {
      var transformedNews = [];

      items.forEach(function(item) {
        transformedNews.push({
          cover: {
            url: item.metadata.cover.link,
            small: item.metadata.cover.small,
            credits: item.metadata.cover.credits,
            subtitle: item.metadata.cover.subtitle
          },
          date: item.published_at,
          description: item.metadata.description,
          title: item.metadata.title,
          path: item.metadata.url,
          hat: item.metadata.hat
        });
      });

      return transformedNews;
    }

    function formatOpinionsAsExpecteBySite(opinions) {
      var strippedOpinions = [];
      opinions.forEach(function(opinionFromMongo) {
        strippedOpinions.push({
          columnist: opinionFromMongo.metadata.columnist,
          title: opinionFromMongo.metadata.title,
          date: opinionFromMongo.published_at,
          path: opinionFromMongo.metadata.url
        });
      });
      return strippedOpinions;
    }

    it('should return the last news grouped by category', function(done) {
      var news = createNewsOfType(15, 'post');
      var opinions = createNewsOfType(5, 'opinion');

      var strippedNews = formatNewsAsExpectedBySite(news);
      var strippedOpinions = formatOpinionsAsExpecteBySite(opinions);

      MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

        db.collection('news').insert(news.concat(opinions), function(err, _result) {
          var expected = {
            featured: [strippedNews[14], strippedNews[13], strippedNews[12], strippedNews[11]],
            secondary: [strippedNews[10], strippedNews[9], strippedNews[8], strippedNews[7]],
            tertiary: [strippedNews[6], strippedNews[5]],
            opinions: [strippedOpinions[4], strippedOpinions[3], strippedOpinions[2]]
          };

          homeStrategy.lastNews(nationalEdition, function(homeNews) {
            assert.deepEqual(homeNews, expected);
            done();
          });
        });
      });
    });

    it('should not break if there is not enough news to fill all groups', function(done) {
      var news = createNewsOfType(1, 'post');

      var transformedNews = formatNewsAsExpectedBySite(news);

      MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

        db.collection('news').insert(news, function(err, _result) {
          var expected = {
            featured: [transformedNews[0]],
            secondary: [],
            tertiary: [],
            opinions: []
          };

          homeStrategy.lastNews(nationalEdition, function(homeNews) {
            assert.deepEqual(homeNews, expected);
            done();
          });
        });
      });
    });

  });

});

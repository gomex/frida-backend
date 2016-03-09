var async           = require('async');
var assert          = require('assert');
var MongoClient     = require('mongodb').MongoClient;
var moment          = require('moment');

var newsRepository  = require('../../../../lib/news/news-repository');
var homeStrategy    = require('../../../../lib/publisher/home-strategy');

var metadataFactory = require('../../../factories/news-attribute').metadata;
var newsFactory     = require('../../../factories/news-attribute').newsAttribute;

describe('home-strategy', function() {

  describe('buildHome', function(){
    before(function(done){
      newsRepository.deleteAll(done);
    });

    function shouldHaveSession(sessionName) {
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

    it('sets layout to "nacional"', function(done){
      homeStrategy.buildHome(function(newsForHome){
        assert.equal(newsForHome.layout, 'nacional');
        done();
      });
    });

    shouldHaveSession('featured_01');

    shouldHaveSession('featured_02');

    shouldHaveSession('featured_03');

    shouldHaveSession('featured_04');

    shouldHaveSession('featured_05');

    shouldHaveSession('featured_06');

    shouldHaveSession('featured_07');

    shouldHaveSession('featured_08');
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

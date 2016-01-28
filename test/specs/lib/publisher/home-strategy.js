var MongoClient     = require('mongodb').MongoClient;
var newsRepository = require('../../../../lib/news/news-repository');
var homeStrategy    = require('../../../../lib/publisher/home-strategy');
var moment         = require('moment');
var _               = require('underscore');
var assert          = require('assert');

describe('News for home strategy:', function() {

    describe('lastNews',function() {

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
            hat: 'Nacional',
            description: 'description',
            url: '2015/12/03/novo-site-do-brasil-de-fato-e-lancado/',
            cover: {
              link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
              small: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
              credits: "credits",
              subtitle: "subtitle"
            },
            published_at: date
          }
        };

        return baseNews;
      };

      function createNews(date) {
        var news = baseNews(date);
        news.metadata.layout = 'post';
        return news;
      };

      function createOpinion(date) {
        var opinion = baseNews(date);
        opinion.metadata.layout = 'opinion';
        opinion.metadata.columnist = 'wandecleya@gmail.com';
        return opinion;
      };


      function createNewsOfType(amount, type) {
            var news = [];
            var startTime = moment();

            var funciontToCall = type === 'post'? createNews : createOpinion;

            for(var i = 0; i < amount; i++) {
              var date = startTime.add(1, 'days').toISOString();
	            news.push(funciontToCall(date));
            }

            return news;
        };

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
              date: item.metadata.published_at,
              description: item.metadata.description,
              title: item.metadata.title,
              path: item.metadata.url,
              hat: item.metadata.hat
            });
          });

          return transformedNews;
        };

      function formatOpinionsAsExpecteBySite(opinions) {
        var strippedOpinions = [];
        opinions.forEach(function(opinionFromMongo) {
          strippedOpinions.push({
            columnist: opinionFromMongo.metadata.columnist,
            title: opinionFromMongo.metadata.title,
            date: opinionFromMongo.metadata.published_at,
            path: opinionFromMongo.metadata.url
          });
        });
        return strippedOpinions;
      };

      it('should return the last news grouped by category', function(done) {
            var news = createNewsOfType(15, 'post');
            var opinions = createNewsOfType(5, 'opinion');

            var strippedNews = formatNewsAsExpectedBySite(news);
            var strippedOpinions = formatOpinionsAsExpecteBySite(opinions);

            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

                db.collection('news').insert(news.concat(opinions), function(err, result) {
                    console.log(err);
                    var expected = {
                        featured: [strippedNews[14], strippedNews[13], strippedNews[12], strippedNews[11]],
                        secondary: [strippedNews[10], strippedNews[9], strippedNews[8], strippedNews[7]],
                        tertiary: [strippedNews[6], strippedNews[5]],
                        opinions: [strippedOpinions[4], strippedOpinions[3], strippedOpinions[2]]
                    };

                    var homeNews = homeStrategy.lastNews(function(homeNews) {
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

                db.collection('news').insert(news, function(err, result) {
                    var expected = {
                        featured: [transformedNews[0]],
                        secondary: [],
                        tertiary: [],
                        opinions: []
                    };

                    var homeNews = homeStrategy.lastNews(function(homeNews) {
                        assert.deepEqual(homeNews, expected);
                        done();
                    });
                });
            });
        });

    });

});

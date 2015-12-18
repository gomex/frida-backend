var MongoClient     = require('mongodb').MongoClient;
var postsRepository = require('../../../../lib/posts-repository')();
var homeStrategy    = require('../../../../lib/publisher/home-strategy');
var moment         = require('moment');
var _               = require('underscore');
var assert          = require('assert');

describe('Posts for home strategy:', function() {

    describe('lastNews',function() {

      beforeEach(function(done){
          MongoClient.connect(process.env.DATABASE_URL, function(err, db) {
              db.collection('posts').drop();
              db.close();
              done();
          });
      });

      function basePost(date) {
        var basePost = {
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

        return basePost;
      };

      function createNews(date) {
        var news = basePost(date);
        news.metadata.layout = 'post';
        return news;
      };

      function createOpinion(date) {
        var opinion = basePost(date);
        opinion.metadata.layout = 'opinion';
        opinion.metadata.columnist = 'wandecleya@gmail.com';
        return opinion;
      };


      function createPosts(amount, type) {
            var posts = [];
            var startTime = moment();

            var createPost = type === 'post'? createNews : createOpinion;

            for(var i = 0; i < amount; i++) {
              var date = startTime.add(1, 'days').toISOString();
	            posts.push(createPost(date));
            }

            return posts;
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
            var news = createPosts(10, 'post');
            var opinions = createPosts(3, 'opinion');

            var strippedNews = formatNewsAsExpectedBySite(news);
            var strippedOpinions = formatOpinionsAsExpecteBySite(opinions);

            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

                db.collection('posts').insert(news.concat(opinions), function(err, result) {
                    console.log(err);
                    var expected = {
                        // TODO forçando a ordem do expected na mão (ruim) conforme como vem do banco - arranjar um jeito da comparação ignorar ordem
                        featured: [strippedNews[9], strippedNews[8], strippedNews[7], strippedNews[6]],
                        secondary: [strippedNews[5], strippedNews[4], strippedNews[3], strippedNews[2]],
                        tertiary: [strippedNews[1], strippedNews[0]],
                        opinions: [strippedOpinions[2], strippedOpinions[1], strippedOpinions[0]]
                    };

                    var homePosts = homeStrategy.lastNews(function(homePosts) {
                        assert.deepEqual(homePosts, expected);
                        done();
                    });
                });
            });
        });

        it('should not break if there is not enough news to fill all groups', function(done) {
            var news = createPosts(1, 'post');

            var transformedNews = formatNewsAsExpectedBySite(news);

            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

                db.collection('posts').insert(news, function(err, result) {
                    var expected = {
                        featured: [transformedNews[0]],
                        secondary: [],
                        tertiary: [],
                        opinions: []
                    };

                    var homePosts = homeStrategy.lastNews(function(homePosts) {
                        assert.deepEqual(homePosts, expected);
                        done();
                    });
                });
            });
        });

    });

});

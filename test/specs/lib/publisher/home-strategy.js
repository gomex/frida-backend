var MongoClient     = require('mongodb').MongoClient;
var postsRepository = require('../../../../lib/posts-repository')();
var homeStrategy    = require('../../../../lib/publisher/home-strategy')();
var moment         = require('moment');
var _               = require('underscore');
var assert          = require('assert');

describe('Posts for home strategy:', function() {

    describe('lastNews',function() {

        beforeEach(function(done){
            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {
                db.collection('posts').drop();
                db.close()
                done();
            });
        });

        function createNews(amount) {
            var news = [];
            var startTime = moment();

            for(var i = 0; i < amount; i++) {
                var date = startTime.add(1, 'days').toISOString();
	            news.push({
	                body:'<h1>the news content</h1>',
	                status: 'published',
	                metadata: {
                        layout: 'post',
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
	            });
            }

            return news;
        };

        function formatAsExpected(items) {
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

         var fakeOpinions = [
            {columnist: "rodrigovieira18@gmail.com", title: "Direitos minerários x direitos sociais: que as mineradoras paguem o justo", date: '2015-12-02T13:47:40-03:00'},
            {columnist: "wandecleya@gmail.com", title: "O funk e o fim da música popular brasileira", date: '2015-12-02T13:47:40-03:00'},
            {columnist: "snowden@gmail.com", title: "Movimento negro: esboço de um caminho que não lorem ipsum lorem ipsum lorem ipsum lorem ipsum", date: '2015-12-02T13:47:40-03:00'}];

        it('should return the last news grouped by category', function(done) {
            var news = createNews(10);

            var transformedNews = formatAsExpected(news);

            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

                db.collection('posts').insert(news, function(err, result) {
                    var expected = {
                        featured: [transformedNews[9], transformedNews[8], transformedNews[7], transformedNews[6]],
                        secondary: [transformedNews[5], transformedNews[4], transformedNews[3], transformedNews[2]],
                        tertiary: [transformedNews[1], transformedNews[0]],
                        opinions: fakeOpinions
                    };

                    var homePosts = homeStrategy.lastNews(function(homePosts) {
                        assert.deepEqual(homePosts, expected);
                        done();
                    });
                });
            });
        });

        it('should not break if there is not enough news to fill all groups', function(done) {
            var news = createNews(1);

            var transformedNews = formatAsExpected(news);

            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

                db.collection('posts').insert(news, function(err, result) {
                    var expected = {
                        featured: [transformedNews[0]],
                        secondary: [],
                        tertiary: [],
                        opinions: fakeOpinions
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

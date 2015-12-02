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
	                    date: date,
	                    title: 'title-' + date,
	                    description: 'description',
	                    url: '2015/12/03/novo-site-do-brasil-de-fato-e-lancado/',
	                    cover: {
	                        link: "//farm9.staticflickr.com/8796/17306389125_7f60267c76_b.jpg",
	                    }
	                }
	            });
            }

            return news;
        };

        function removeExtraFields(items) {
            var strippedClones = [];

            items.forEach(function(item) {
                var copy = _.omit(_.clone(item), 'status', 'body');
                copy.metadata = _.omit(_.clone(copy.metadata), 'date');
                strippedClones.push(copy);
            });

            return strippedClones;
        };

        it('should return the last news grouped by category', function(done) {
            var news = createNews(10);

            var strippedNews = removeExtraFields(news);

            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

                db.collection('posts').insert(news, function(err, result) {
                    var expected = {
                        featured: [strippedNews[9], strippedNews[8], strippedNews[7], strippedNews[6]],
                        secondary: [strippedNews[5], strippedNews[4], strippedNews[3], strippedNews[2]],
                        tertiary: [strippedNews[1], strippedNews[0]]
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

            var strippedNews = removeExtraFields(news);

            MongoClient.connect(process.env.DATABASE_URL, function(err, db) {

                db.collection('posts').insert(news, function(err, result) {
                    var expected = {
                        featured: [strippedNews[0]],
                        secondary: [],
                        tertiary: []
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

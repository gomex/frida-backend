'use strict';

var MongoClient     = require('mongodb').MongoClient;

var connect = function(callback){
  MongoClient.connect(process.env.DATABASE_URL, function(err, db){
    callback(db.collection('posts'));
  });
};

module.exports = function() {
  return {
    lastNews:  function(callback) {
       var FEATURED_LIMIT    = 4;
       var SECONDARY_LIMIT   = 4;
       var TERTIARY_LIMIT    = 2;

       connect(function(collection){
         var criteria = { 'status': 'published' };
         var projection = { '_id': false,
                            'cover.url': '$metadata.cover.link',
                            'cover.small': '$metadata.cover.small',
                            'cover.credits': '$metadata.cover.credits',
                            'cover.subtitle': '$metadata.cover.subtitle',
                            'date': '$metadata.published_at',
                            'description':'$metadata.description',
                            'title':'$metadata.title',
                            'path': '$metadata.url',
                            'hat': '$metadata.hat'};
         var limit = FEATURED_LIMIT + SECONDARY_LIMIT + TERTIARY_LIMIT;
         var sort = {'metadata.published_at': -1};

         collection.aggregate([{'$match': criteria}, {'$limit': limit}, {'$sort': sort}, {'$project': projection}])
         .toArray(function(errs, lastNews){
           var featured  = lastNews.splice(0, FEATURED_LIMIT);
           var secondary = lastNews.splice(0, SECONDARY_LIMIT);
           var tertiary  = lastNews.splice(0, TERTIARY_LIMIT);

           callback({featured: featured, secondary: secondary, tertiary: tertiary});
         });
       });
    }
  };
};

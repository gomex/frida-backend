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
         var projection = { _id: 0,
                          'metadata.title': 1,
                          'metadata.description': 1,
                          'metadata.url': 1,
                          'metadata.cover.link': 1} ;

         collection.find(criteria, projection)
         .limit(FEATURED_LIMIT + SECONDARY_LIMIT + TERTIARY_LIMIT)
         .sort({'metadata.date': -1})
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

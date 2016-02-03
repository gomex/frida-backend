'use strict';

var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var _ = require('underscore');
var FEATURED_LIMIT    = 4;
var SECONDARY_LIMIT   = 4;
var TERTIARY_LIMIT    = 2;
var OPINIONS_LIMIT    = 3;

function getOpinions (cb) {
  var criteria = {
    'status': 'published',
    'metadata.layout': 'opinion'
  };
  var projection = {
    '_id': false,
    'columnist': '$metadata.columnist',
    'title': '$metadata.title',
    'date': '$published_at',
    'path': '$metadata.url'
  };
  var limit = OPINIONS_LIMIT;
  var sort = {
    'published_at': -1
  };
  var data = {};

  MongoClient.connect(process.env.DATABASE_URL, function (err, db) {
    db.collection('news').aggregate([
      {'$match': criteria},
      {'$sort': sort},
      {'$limit': limit},
      {'$project': projection}
    ]).toArray(function (errs, lastOpinions) {
      if (errs) {
        db.close();
        cb(errs);
      } else {
        data.opinions = lastOpinions;
        db.close();
        cb(null, data);
      }
    });
  });
}

function getNews (edition, cb) {
  var criteria = {
    'status': 'published',
    'metadata.layout': 'post',
    'metadata.edition': edition
  };
  var projection = {
    '_id': false,
    'cover.url': '$metadata.cover.link',
    'cover.small': '$metadata.cover.small',
    'cover.credits': '$metadata.cover.credits',
    'cover.subtitle': '$metadata.cover.subtitle',
    'date': '$published_at',
    'description':'$metadata.description',
    'title':'$metadata.title',
    'path': '$metadata.url',
    'hat': '$metadata.hat'
  };
  var limit = FEATURED_LIMIT + SECONDARY_LIMIT + TERTIARY_LIMIT;
  var sort = {
    'published_at': -1
  };
  var data = {};

  MongoClient.connect(process.env.DATABASE_URL, function (err, db) {
    db.collection('news').aggregate([
      {'$match': criteria},
      {'$sort': sort},
      {'$limit': limit},
      {'$project': projection}
    ]).toArray(function(errs, lastNews) {
      if (errs) {
        db.close();
        cb(errs);
      } else {
        data.featured = lastNews.splice(0, FEATURED_LIMIT);
        data.secondary = lastNews.splice(0, SECONDARY_LIMIT);
        data.tertiary = lastNews.splice(0, TERTIARY_LIMIT);
        db.close();
        cb(null, data);
      }
    });
  });
};

function lastNews (edition, callback) {
  async.parallel([
    async.apply(getNews, edition),
    getOpinions
  ], function (err, data) {
    callback(_.extend.apply(null, [{}].concat(data)));
  });
}

module.exports = {
  lastNews: lastNews
};

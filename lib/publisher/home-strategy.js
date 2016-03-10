'use strict';

var _           = require('underscore');
var async       = require('async');
var MongoClient = require('mongodb').MongoClient;

var newsRepository  = require('../news/news-repository');

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
}

function lastNews (edition, callback) {
  async.parallel([
    async.apply(getNews, edition),
    getOpinions
  ], function (err, data) {
    callback(_.extend.apply(null, [{}].concat(data)));
  });
}

function publishedNewsCriteria(displayArea) {
  return {
    'status': 'published',
    'metadata.layout': 'post',
    'metadata.display_area': displayArea
  };
}

function publishedColumnCriteria(displayArea){
  return {
    'status': 'published',
    'metadata.layout': 'opinion',
    'metadata.display_area': displayArea
  };
}

var lastNewsCriteria = {
  'status': 'published',
  'metadata.layout': 'post'
};

var newsProjection = {
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

var columnProjection = {
  '_id': false,
  'columnist': '$metadata.columnist',
  'title': '$metadata.title',
  'date': '$published_at',
  'path': '$metadata.url'
};

var sortByPublishedDate = { 'published_at': -1 };

function buildHome(callback) {
  var newsForHome = {};

  async.parallel({
    featured_01: async.apply(newsRepository.find, publishedNewsCriteria('featured_01'), newsProjection, 1, sortByPublishedDate),
    featured_02: async.apply(newsRepository.find, publishedNewsCriteria('featured_02'), newsProjection, 1, sortByPublishedDate),
    featured_03: async.apply(newsRepository.find, publishedNewsCriteria('featured_03'), newsProjection, 1, sortByPublishedDate),
    featured_04: async.apply(newsRepository.find, publishedNewsCriteria('featured_04'), newsProjection, 1, sortByPublishedDate),
    featured_05: async.apply(newsRepository.find, publishedNewsCriteria('featured_05'), newsProjection, 1, sortByPublishedDate),
    featured_06: async.apply(newsRepository.find, publishedNewsCriteria('featured_06'), newsProjection, 1, sortByPublishedDate),
    featured_07: async.apply(newsRepository.find, publishedNewsCriteria('featured_07'), newsProjection, 1, sortByPublishedDate),
    featured_08: async.apply(newsRepository.find, publishedNewsCriteria('featured_08'), newsProjection, 1, sortByPublishedDate),
    column_01: async.apply(newsRepository.find, publishedColumnCriteria('column_01'), columnProjection, 1, sortByPublishedDate),
    column_02: async.apply(newsRepository.find, publishedColumnCriteria('column_02'), columnProjection, 1, sortByPublishedDate),
    column_03: async.apply(newsRepository.find, publishedColumnCriteria('column_03'), columnProjection, 1, sortByPublishedDate),
    last_news: async.apply(newsRepository.find, lastNewsCriteria, newsProjection, 6, sortByPublishedDate)
  }, function(err, result){
    newsForHome = _.mapObject(result, function(value, _key) {
      return (value.length === 1) ? _.first(value) : value;
    });

    newsForHome.layout = 'nacional';

    callback(newsForHome);
  });

}

module.exports = {
  lastNews: lastNews,
  buildHome: buildHome
};

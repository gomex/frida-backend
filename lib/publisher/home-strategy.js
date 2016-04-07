'use strict';

var _           = require('underscore');
var async       = require('async');

var newsRepository  = require('../news/news-repository');

function publishedNewsWith(displayArea) {
  return {
    'status': 'published',
    'metadata.layout': 'post',
    'metadata.display_area': displayArea
  };
}

function publishedColumnWith(displayArea){
  return {
    'status': 'published',
    'metadata.layout': 'column',
    'metadata.display_area': displayArea
  };
}

function publishedTabloid(displayArea){
  return {
    'status': 'published',
    'metadata.layout': 'tabloid',
    'metadata.display_area': displayArea
  };
}

var lastNews = {
  'status': 'published',
  'metadata.layout': 'post'
};

var mostRead = {
  'status': 'published',
  'metadata.layout': 'post',
  'metadata.most_read': true
};

var photoCaption = {
  'status': 'published',
  'metadata.layout': 'photo_caption'
};

var photoCaptionProjection = {
  '_id': false,
  'cover.url': '$metadata.cover.link',
  'cover.small': '$metadata.cover.small',
  'cover.credits': '$metadata.cover.credits',
  'cover.subtitle': '$metadata.cover.subtitle',
  'date': '$published_at',
  'title':'$metadata.title',
  'path': '$metadata.url'
};

var newsProjection = {
  '_id': false,
  'cover.url': '$metadata.cover.link',
  'cover.small': '$metadata.cover.small',
  'cover.medium': '$metadata.cover.medium',
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

var tabloidProjection = {
  '_id': false,
  'cover.url': '$metadata.cover.link',
  'cover.small': '$metadata.cover.small',
  'cover.medium': '$metadata.cover.medium',
  'cover.credits': '$metadata.cover.credits',
  'cover.subtitle': '$metadata.cover.subtitle',
  'date': '$published_at',
  'title':'$metadata.title',
  'path': '$metadata.url'
};

var sortByPublishedDate = { 'published_at': -1 };

function buildHome(callback) {
  var newsForHome = {};

  async.parallel({
    featured_01: async.apply(newsRepository.find, publishedNewsWith('featured_01'), newsProjection, 1, sortByPublishedDate),
    featured_02: async.apply(newsRepository.find, publishedNewsWith('featured_02'), newsProjection, 1, sortByPublishedDate),
    featured_03: async.apply(newsRepository.find, publishedNewsWith('featured_03'), newsProjection, 1, sortByPublishedDate),
    featured_04: async.apply(newsRepository.find, publishedNewsWith('featured_04'), newsProjection, 1, sortByPublishedDate),
    featured_05: async.apply(newsRepository.find, publishedNewsWith('featured_05'), newsProjection, 1, sortByPublishedDate),
    featured_06: async.apply(newsRepository.find, publishedNewsWith('featured_06'), newsProjection, 1, sortByPublishedDate),
    featured_07: async.apply(newsRepository.find, publishedNewsWith('featured_07'), newsProjection, 1, sortByPublishedDate),
    featured_08: async.apply(newsRepository.find, publishedNewsWith('featured_08'), newsProjection, 1, sortByPublishedDate),
    column_01: async.apply(newsRepository.find, publishedColumnWith('column_01'), columnProjection, 1, sortByPublishedDate),
    column_02: async.apply(newsRepository.find, publishedColumnWith('column_02'), columnProjection, 1, sortByPublishedDate),
    column_03: async.apply(newsRepository.find, publishedColumnWith('column_03'), columnProjection, 1, sortByPublishedDate),
    rio_de_janeiro: async.apply(newsRepository.find, publishedTabloid('tabloid_rj'), tabloidProjection, 1, sortByPublishedDate),
    minas_gerais: async.apply(newsRepository.find, publishedTabloid('tabloid_mg'), tabloidProjection, 1, sortByPublishedDate),
    parana: async.apply(newsRepository.find, publishedTabloid('tabloid_pr'), tabloidProjection, 1, sortByPublishedDate),
    last_news: async.apply(newsRepository.find, lastNews, newsProjection, 6, sortByPublishedDate),
    most_read: async.apply(newsRepository.find, mostRead, newsProjection, 5, sortByPublishedDate),
    photo_caption: async.apply(newsRepository.find, photoCaption, photoCaptionProjection, 1, sortByPublishedDate)
  }, function(err, result){
    if(!err) {
      var fieldsToRemove = [];
      newsForHome = _.mapObject(result, function(value, key) {
        if(value.length === 0) fieldsToRemove.push(key);

        return (value.length === 1) ? _.first(value) : value;
      });

      _.each(fieldsToRemove, function(field) {
        delete newsForHome[field];
      });

      newsForHome.layout = 'national';
    }

    callback(err, newsForHome);
  });

}

module.exports = {
  buildHome: buildHome
};

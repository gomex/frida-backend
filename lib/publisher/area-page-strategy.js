'use strict';

var newsRepository  = require('../news/news-repository');

var NEWS_LIMIT = 20;

function publishedNewsFor(area) {
  return {
    'status': 'published',
    'metadata.layout': 'post',
    'metadata.area': area
  };
}

var publishedColumns = {
  'status': 'published',
  'metadata.layout': 'column'
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
  'description': '$metadata.description',
  'date': '$published_at',
  'path': '$metadata.url'
};

var sortByPublishedDate = { 'published_at': -1 };

function replaceWordSeparator(areaName) {
  return areaName.replace(/_/g, ' ');
}

function buildAreaPageData(area, callback) {
  var pageData = {};

  newsRepository.find(publishedNewsFor(area), newsProjection, NEWS_LIMIT, sortByPublishedDate, function(err, result) {
    if(!err) {
      pageData.layout = 'news_list';
      pageData.news = result;
      pageData.area = replaceWordSeparator(area);
    }

    callback(err, pageData);
  });
}

function buildColumnsPageData(callback) {
  var pageData = {};

  newsRepository.find(publishedColumns, columnProjection, NEWS_LIMIT, sortByPublishedDate, function(err, result) {
    if(!err) {
      pageData.layout  = 'columnists';
      pageData.columns = result;
    }

    callback(err, pageData);
  });
}

function buildPageData(area, callback) {
  if(area === 'column') {
    buildColumnsPageData(callback);
  } else {
    buildAreaPageData(area, callback);
  }
}

module.exports = {
  buildPageData: buildPageData
};

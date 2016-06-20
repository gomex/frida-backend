'use strict';

var News  = require('../models/news');

var NEWS_LIMIT = 20;

function publishedNewsFor(area) {
  if (area == 'ultimas_noticias') {
    return {
      'status': 'published',
      'metadata.layout': 'post'
    };
  }
  else {
    return {
      'status': 'published',
      'metadata.layout': 'post',
      'metadata.area': area
    };
  }
}

var publishedColumns = {
  'status': 'published',
  'metadata.layout': 'column'
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
  'description': '$metadata.description',
  'date': '$published_at',
  'path': '$metadata.url'
};

var sortByPublishedDate = { 'published_at': -1 };

function toDisplayName(areaName) {
  if(identifierToDisplayName[areaName]) {
    return identifierToDisplayName[areaName];
  } else {
    return  areaName;
  }
}

var identifierToDisplayName = {
  'direitos_humanos': 'direitos humanos',
  'espanol': 'español',
  'ultimas_noticias': 'últimas notícias'
};

function buildAreaPageData(area, callback) {
  var pageData = {};

  News.findNews(publishedNewsFor(area), newsProjection, NEWS_LIMIT, sortByPublishedDate, function(err, result) {
    if(!err) {
      pageData.layout = 'news_list';
      pageData.news = result;
      pageData.area = toDisplayName(area);
    }

    callback(err, pageData);
  });
}

function buildColumnsPageData(callback) {
  var pageData = {};

  News.findNews(publishedColumns, columnProjection, NEWS_LIMIT, sortByPublishedDate, function(err, result) {
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

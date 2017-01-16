'use strict';

var _ = require('underscore');
var News  = require('../models/news');
var Utils = require('./utils');

var NEWS_LIMIT = 20;
var NEWS_PAGES = 2;

function createAreaFrontMatter(area, result, numPages) {
  return function(i) {
    return {
      layout: 'news_list',
      news: result.slice(i*NEWS_LIMIT, (i+1)*NEWS_LIMIT),
      area: Utils.toDisplayName(area),
      current: i,
      total: numPages,
      next: (i < numPages-1),
      prev: (i > 0)
    };
  };
}

function buildAreaPageData(area, callback) {
  var pageData = [];

  News.findNews(Utils.publishedNewsFor(area), Utils.newsProjection, NEWS_LIMIT*NEWS_PAGES, Utils.sortByPublishedDate, function(err, result) {
    if(!err) {
      var numPages = Math.ceil(result.length/NEWS_LIMIT);
      if(numPages > 0) {
        pageData = _.range(numPages).map(createAreaFrontMatter(area, result, numPages));
      }
      else {
        pageData = [{
          layout: 'news_list',
          news: result,
          area: Utils.toDisplayName(area)
        }];
      }
    }

    callback(err, pageData);
  });
}

function createColumnsFrontMatter(result, numPages) {
  return function(i) {
    return {
      layout: 'columnists',
      columns: result.slice(i*NEWS_LIMIT, (i+1)*NEWS_LIMIT),
      current: i,
      total: numPages,
      next: (i < numPages-1),
      prev: (i > 0)
    };
  };
}

function buildColumnsPageData(callback) {
  var pageData = [];

  News.findNews(Utils.publishedColumns, Utils.columnProjection, NEWS_LIMIT*NEWS_PAGES, Utils.sortByPublishedDate, function(err, result) {
    if(!err) {
      var numPages = Math.ceil(result.length/NEWS_LIMIT);
      if(numPages > 0) {
        pageData = _.range(numPages).map(createColumnsFrontMatter(result, numPages));
      }
      else {
        pageData = [{
          layout: 'columnists',
          columns: result
        }];
      }
    }

    callback(err, pageData);
  });
}

function buildColumnistPageData(area, callback) {
  var pageData = [];

  News.findNews(Utils.publishedColumns, Utils.columnProjection, NEWS_LIMIT*NEWS_PAGES, Utils.sortByPublishedDate, function(err, result) {
    if(!err) {
      var numPages = Math.ceil(result.length/NEWS_LIMIT);
      if(numPages > 0) {
        pageData = _.range(numPages).map(createAreaFrontMatter(area, result, numPages));
      }
      else {
        pageData = [{
          layout: 'news_list',
          news: result,
          area: Utils.toDisplayName(area)
        }];
      }
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
  buildPageData: buildPageData,
  buildColumnistPageData: buildColumnistPageData
};

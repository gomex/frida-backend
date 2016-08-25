'use strict';

var _ = require('underscore');
var News  = require('../models/news');
var Utils = require('./utils');

var OTHER_NEWS_LIMIT = 3;

function createPostOtherData(news) {
  var otherData = {};
  otherData.title = news.title;
  otherData.url = news.path;
  if(news.cover){
    otherData.cover = {
      link: news.cover.medium,
      subtitle: news.cover.subtitle,
      credits: news.cover.credits
    };
  }
  return otherData;
}

function getNewsDataBasedOnCriteria(criteria, callback) {
  var pageData = [];

  News.findNews(criteria, Utils.newsProjection, OTHER_NEWS_LIMIT, Utils.sortByPublishedDate, function(err, result) {
    if(!err) {
      var numNews = result.length;
      if(numNews > 0) {
        pageData = _.map(result, createPostOtherData);
      }
    }

    callback(err, pageData);
  });
}

function buildOtherNewsData(news, callback) {

  getNewsDataBasedOnCriteria(Utils.publishedNewsByHat(news), function(err, result) {
    if(result.length < OTHER_NEWS_LIMIT) {
      getNewsDataBasedOnCriteria(Utils.publishedNewsByArea(news), function(err, anotherResult) {
        callback(err, result.concat(_.sample(anotherResult, OTHER_NEWS_LIMIT-result.length)));
      });
    }
    else {
      callback(err, result);
    }
  });
}

module.exports = {
  buildOtherNewsData: buildOtherNewsData
};

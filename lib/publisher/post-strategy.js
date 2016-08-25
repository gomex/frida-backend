'use strict';

var _ = require('underscore');
var News  = require('../models/news');
var Utils = require('./utils');

var OTHER_NEWS_LIMIT = 3;

function getNewsDataBasedOnCriteria(criteria, callback) {
  News.findNews(criteria, Utils.newsProjection, OTHER_NEWS_LIMIT, Utils.sortByPublishedDate, function(err, result) {
    var pageData = _.map(result, (news) => {
      return {
        title: news.title,
        url: news.path
      };
    });

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

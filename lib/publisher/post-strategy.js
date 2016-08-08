'use strict';

var _ = require('underscore');
var News  = require('../models/news');
var Utils = require('./utils');

var OTHER_NEWS_LIMIT = 3;

function createPostOtherData(result) {
  return function(i) {
    var otherData = {};
    otherData.title = result[i].title;
    otherData.url = result[i].path;
    if(result[i].cover){
      otherData.cover = {
        link: result[i].cover.medium,
        subtitle: result[i].cover.subtitle,
        credits: result[i].cover.credits
      };
    }
    return otherData;
  };
}

function buildOtherNewsData(news, callback) {
  var pageData = [];

  News.findNews(Utils.publishedNewsByHat(news), Utils.newsProjection, OTHER_NEWS_LIMIT, Utils.sortByPublishedDate, function(err, result) {
    if(!err) {
      var numNews = result.length;
      if(numNews > 0) {
        pageData = _.range(numNews).map(createPostOtherData(result));
      }
    }

    callback(err, pageData);
  });
}

module.exports = {
  buildOtherNewsData: buildOtherNewsData
};

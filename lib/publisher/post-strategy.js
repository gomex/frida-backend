'use strict';

var News  = require('../models/news');
var _ = require('underscore');

function buildOtherNewsData(news, callback) {
  News.findOtherNews(news, (err, result) => {
    var list = _.map(result, (value) => {
      return {
        title: value.metadata.title,
        url: value.metadata.url
      };
    });

    callback(err, list);
  });
}

module.exports = {
  buildOtherNewsData: buildOtherNewsData
};

'use strict';

var _       = require('underscore');
var moment  = require('moment');
var slug    = require('slug');

var urlFormated = function(news) {
  var  titleSlug = slug(news.metadata.title, {lower: true} );

  var momentCreatedAt = moment(news.created_at);
  var  year = momentCreatedAt.format('YYYY');
  var  month = momentCreatedAt.format('MM');
  var  day  = momentCreatedAt.format('DD');

  return _.compact([year, month, day, titleSlug]).join('/') + '/';
};

module.exports = {

  prepare: function(body){
    if (!!body.metadata && typeof body.metadata === 'string') {
      body.metadata = JSON.parse(body.metadata);
    }

    body.status = 'draft';
    body.created_at = Date.now();

    body.metadata.url = urlFormated(body);

    return body;
  }

};

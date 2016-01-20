'use strict';

var slug    = require('slug');
var moment  = require('moment');
var _       = require('underscore');


var urlFormated = function(title, createdDate, edition){
  var  titleSlug = slug( title || (new Date().getTime()), {lower: true});
  var editionSlug = slug(edition || '', {lower: true}).replace(/not-a-link/,'');

  var momentCreatedDate = moment(createdDate);
  var  year = momentCreatedDate.format('YYYY');
  var  month = momentCreatedDate.format('MM');
  var  day  = momentCreatedDate.format('DD');

  return _.compact([editionSlug, year, month, day, titleSlug]).join('/') + '/';
};

module.exports = {

    prepare: function(body){
      body.insertDate = new Date();

      if (!!body.metadata && typeof body.metadata === 'string') {
        body.metadata = JSON.parse(body.metadata);
      }

      body.metadata.url = urlFormated(body.metadata.title,
                                      body.metadata.date,
                                      body.metadata.edition);

      delete body._id;

      return body;

    }

};
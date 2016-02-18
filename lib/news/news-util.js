'use strict';

var _       = require('underscore');
var moment  = require('moment');
var slug    = require('slug');


var urlFormated = function(title, createdDate){
  var  titleSlug = slug( title || (new Date().getTime()), {lower: true});

  var momentCreatedDate = moment(createdDate);
  var  year = momentCreatedDate.format('YYYY');
  var  month = momentCreatedDate.format('MM');
  var  day  = momentCreatedDate.format('DD');

  return _.compact([year, month, day, titleSlug]).join('/') + '/';
};

module.exports = {

    prepare: function(body){

      if (!!body.metadata && typeof body.metadata === 'string') {
        body.metadata = JSON.parse(body.metadata);
      }

      // FIXME fix for columnists - all columnists are forced to be from national, for now
      if(body.metadata.layout === 'opinion') {
        body.metadata.edition = '[not-a-link]';
      }
      // end of FIX

      body.metadata.url = urlFormated(body.metadata.title,
                                      body.metadata.date);

      return body;

    }

};

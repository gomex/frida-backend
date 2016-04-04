'use strict';

var _       = require('underscore');

module.exports = {

  prepare: function(body){
    if (!!body.metadata && typeof body.metadata === 'string') {
      body.metadata = JSON.parse(body.metadata);
    }

    if(_.isEmpty(body.metadata.cover) || _.isEmpty(body.metadata.cover.link)) {
      delete body.metadata.cover;
    }

    body.status = 'draft';
    body.created_at = Date.now();

    return body;
  }

};

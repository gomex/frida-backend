'use strict';
var slug          = require('slug');

module.exports = {

    prepare: function(body){
      body.insertDate = new Date();

      if (!!body.metadata && typeof body.metadata === 'string') {
        body.metadata = JSON.parse(body.metadata);
      }

      body.metadata.url = slug(body.metadata.title || (new Date().getTime()), {lower: true}) + '/';
      
      delete body._id;

      return body;
    }
 
};

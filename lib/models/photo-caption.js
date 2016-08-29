var News = require('./news');
var _ = require('underscore');

var LIMIT = 10;

function find(photoCaption, callback) {
  var query = {
    'metadata.layout': 'photo_caption',
    status: 'published'
  };

  var options = {limit: LIMIT, sort: '-created_at'};

  News.find(query, null, options, callback);
}

function findPhotoCaption(news, callback) {
  var query = {
    'metadata.layout': 'photo_caption',
    status: 'published'
  };

  var options = {limit: 1};

  News.find(query, null, options, (err, photoCaption) => {
    callback(err, _.first(photoCaption));
  });
}

module.exports = {
  find: find,
  findPhotoCaption: findPhotoCaption
};

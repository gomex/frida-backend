var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('layout', 'photo_caption')
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('cover', function() { return coverAttributes.build(); })
  .attr('files', function() { return coverAttributes.buildList(1); });

var photoCaption = new Factory()
  .attr('metadata', function() { return metadata.build(); });

module.exports.photoCaption = photoCaption;

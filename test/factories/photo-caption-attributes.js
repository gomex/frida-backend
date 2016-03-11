var Factory = require('rosie').Factory;
var faker = require('faker');

var cover = new Factory()
  .attr('link', function() { return faker.image.imageUrl(); })
  .attr('thumbnail', function() { return faker.image.imageUrl(); })
  .attr('medium', function() { return faker.image.imageUrl(); })
  .attr('small', function() { return faker.image.imageUrl(); })
  .attr('title', 'The picture\'s title')
  .attr('cover', true)
  .attr('credits', 'Photographer')
  .attr('subtitle', 'A beautiful picture');

var photoCaptionMetadata = new Factory()
  .attr('layout', 'photo_caption')
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('cover', function() { return cover.build(); })
  .attr('files', function() { return [cover.build() ]; });

var photoCaptionAttributes = new Factory()
  .attr('metadata', function() { return photoCaptionMetadata.build(); });

module.exports.photoCaptionAttributes = photoCaptionAttributes;

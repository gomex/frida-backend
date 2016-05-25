var Factory = require('rosie').Factory;
var faker = require('faker');

var coverAttributes = new Factory()
  .attr('link', function() { return faker.image.imageUrl(); })
  .attr('thumbnail', function() { return faker.image.imageUrl(); })
  .attr('medium', function() { return faker.image.imageUrl(); })
  .attr('small', function() { return faker.image.imageUrl(); })
  .attr('title', 'The picture\'s title')
  .attr('cover', true)
  .attr('credits', 'Photographer')
  .attr('subtitle', 'A beautiful picture');

module.exports.coverAttributes = coverAttributes;

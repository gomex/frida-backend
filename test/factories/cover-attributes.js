var Factory = require('rosie').Factory;
var faker = require('faker');

var cover = new Factory()
  .attr('link', function() { return faker.image.imageUrl(); })
  .attr('thumbnail', function() { return faker.image.imageUrl(); })
  .attr('medium', function() { return faker.image.imageUrl(); })
  .attr('small', function() { return faker.image.imageUrl(); })
  .attr('title', 'The picture\'s title')
  .attr('credits', 'Photographer')
  .attr('subtitle', 'A beautiful picture');

module.exports.cover = cover;

var Factory = require('rosie').Factory;
var faker = require('faker');

var mobile = new Factory()
  .attr('link', faker.image.imageUrl)
  .attr('thumbnail', faker.image.imageUrl)
  .attr('medium', faker.image.imageUrl)
  .attr('small', faker.image.imageUrl);

var cover = new Factory()
  .attr('link', faker.image.imageUrl)
  .attr('thumbnail', faker.image.imageUrl)
  .attr('medium', faker.image.imageUrl)
  .attr('small', faker.image.imageUrl)
  .attr('title', 'The picture\'s title')
  .attr('credits', 'Photographer')
  .attr('subtitle', 'A beautiful picture')
  .attr('mobile', () => mobile.build());

module.exports.cover = cover;

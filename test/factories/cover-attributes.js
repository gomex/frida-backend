var Factory = require('rosie').Factory;
var faker = require('faker');

var mobile = new Factory()
  .attr('link', faker.image.imageUrl)
  .attr('original', faker.image.imageUrl)
  .attr('thumbnail', faker.image.imageUrl)
  .attr('medium', faker.image.imageUrl)
  .attr('small', faker.image.imageUrl);

var cover = new Factory()
  .attr('link', () => faker.image.imageUrl(600,400))
  .attr('original', () => faker.image.imageUrl(600,400))
  .attr('thumbnail', () => faker.image.imageUrl(600,400))
  .attr('medium', () => faker.image.imageUrl(600,400))
  .attr('small', () => faker.image.imageUrl(600,400))
  .attr('title', 'The picture\'s title')
  .attr('credits', 'Photographer')
  .attr('subtitle', 'A beautiful picture')
  .attr('mobile', () => mobile.build());

module.exports.cover = cover;

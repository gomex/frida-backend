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

var tabloidMetadata = new Factory()
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('layout', 'tabloid')
  .attr('display_area', 'tabloid_pr')
  .attr('cover', function() { return cover.build(); })
  .attr('files', function() { return [cover.build() ]; });

var tabloidAttributes = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('issuu', function() { return faker.internet.url(); })
  .attr('edition', function() { return faker.lorem.words(); })
  .attr('metadata', function() { return tabloidMetadata.build(); });

module.exports.tabloidMetadata = tabloidMetadata;
module.exports.tabloidAttributes = tabloidAttributes;

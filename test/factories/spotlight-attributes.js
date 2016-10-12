var Factory = require('rosie').Factory;
var faker = require('faker');

var metadata = new Factory()
  .attr('layout', 'spotlight')
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('display_area', 'spotlight_01');

var spotlight = new Factory()
  .attr('metadata', function() { return metadata.build(); })
  .attr('link', function() { return faker.internet.url(); })
  .attr('image', function() { return faker.image.imageUrl(); });

module.exports.spotlight = spotlight;
module.exports.metadata = metadata;

var Factory = require('rosie').Factory;
var faker = require('faker');

var metadata = new Factory()
  .attr('layout', 'advertising')
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('display_area', 'advertising_01');

var advertising = new Factory()
  .attr('metadata', function() { return metadata.build(); })
  .attr('link', function() { return faker.internet.url(); })
  .attr('image', function() { return faker.internet.url; });

module.exports.advertising = advertising;

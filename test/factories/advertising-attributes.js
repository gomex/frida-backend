var Factory = require('rosie').Factory;
var faker = require('faker');

var metadata = new Factory()
  .attr('layout', 'advertising')
  .attr('title', () => { return faker.lorem.sentence(); })
  .attr('display_area', 'advertising_01');

var advertising = new Factory()
  .attr('metadata', () => { return metadata.build(); })
  .attr('link', () => { return faker.internet.url(); })
  .attr('image', () => { return faker.image.imageUrl(); });

module.exports.advertising = advertising;
module.exports.metadata = metadata;

var Factory = require('rosie').Factory;
var faker = require('faker');

var metadata = new Factory()
  .attr('layout', 'column')
  .attr('columnist', function() { return faker.internet.email(); })
  .attr('hat', 'Opinião')
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('display_area', 'column_01')
  .attr('description', function() { return faker.lorem.sentences(); });

var column = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('metadata', function() { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.column = column;

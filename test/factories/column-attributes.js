var Factory = require('rosie').Factory;
var faker = require('faker');

var columnMetadata = new Factory()
  .attr('layout', 'opinion')
  .attr('columnist', function() { return faker.internet.email(); })
  .attr('hat', 'Opinião')
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('display_area', 'column_01')
  .attr('description', function() { return faker.lorem.sentences(); });

var columnAttributes = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('metadata', function() { return columnMetadata.build(); });

module.exports.columnMetadata = columnMetadata;
module.exports.columnAttributes = columnAttributes;

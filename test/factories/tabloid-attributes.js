var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').coverAttributes;

var tabloidMetadata = new Factory()
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('layout', 'tabloid')
  .attr('display_area', 'tabloid_pr')
  .attr('cover', function() { return coverAttributes.build(); })
  .attr('files', function() { return coverAttributes.buildList(1); });

var tabloidAttributes = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('issuu', function() { return faker.internet.url(); })
  .attr('edition', function() { return faker.lorem.word(); })
  .attr('regional_area', function() { return faker.lorem.word(); })
  .attr('metadata', function() { return tabloidMetadata.build(); });

module.exports.tabloidMetadata = tabloidMetadata;
module.exports.tabloidAttributes = tabloidAttributes;

var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('layout', 'tabloid')
  .attr('display_area', 'tabloid_pr')
  .attr('cover', function() { return coverAttributes.build(); })
  .attr('files', function() { return coverAttributes.buildList(1); });

var tabloid = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('issuu', function() { return faker.internet.url(); })
  .attr('edition', function() { return faker.lorem.word(); })
  .attr('regional_area', function() { return faker.lorem.word(); })
  .attr('metadata', function() { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.tabloid = tabloid;

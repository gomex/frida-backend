var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', () => { return faker.lorem.sentence(); })
  .attr('layout', 'tabloid')
  .attr('display_area', 'tabloid_pr')
  .attr('cover', () => { return coverAttributes.build(); });

var tabloid = new Factory()
  .attr('body', () => { return faker.lorem.paragraphs(); })
  .attr('issuu', () => { return faker.internet.url(); })
  .attr('edition', () => { return faker.lorem.word(); })
  .attr('metadata', () => { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.tabloid = tabloid;

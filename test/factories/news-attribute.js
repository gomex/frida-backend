var Factory = require('rosie').Factory;
var faker = require('faker');

var metadata = new Factory()
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('layout', 'post')
  .attr('edition', 'minas-gerais')
  .attr('area', 'nacional')
  .attr('display_area', 'destaque_foto_grande')
  .attr('hat', function() { return faker.lorem.words(); })
  .attr('description', function() { return faker.lorem.sentences(); })
  .attr('author', function() { return faker.name.findName(); })
  .attr('place', function() { return faker.address.state(); })
  .attr('cover', {})
  .attr('files', []);

var newsAttribute = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('metadata', function() { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.newsAttribute = newsAttribute;

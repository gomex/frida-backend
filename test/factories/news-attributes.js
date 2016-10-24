var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('layout', 'post')
  .attr('area', 'nacional')
  .attr('display_area', 'destaque_foto_grande')
  .attr('hat', 'Olimpíadas')
  .attr('description', function() { return faker.lorem.sentences(); })
  .attr('author', function() { return faker.name.findName(); })
  .attr('place', function() { return faker.address.state(); })
  .attr('cover', function() { return coverAttributes.build(); });

var news = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('audio', function() { return 'https://soundcloud.com/user-555/oi'; })
  .attr('metadata', function() { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.news = news;

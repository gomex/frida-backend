var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', () => { return faker.lorem.sentence(); })
  .attr('layout', 'post')
  .attr('area', 'internacional')
  .attr('display_area', 'destaque_foto_grande')
  .attr('hat', 'Olimpíadas')
  .attr('description', () => { return faker.lorem.sentences(); })
  .attr('author', () => { return faker.name.findName(); })
  .attr('place', () => { return faker.address.state(); })
  .attr('cover', () => { return coverAttributes.build(); });

var news = new Factory()
  .attr('body', () => { return faker.lorem.paragraphs(); })
  .attr('audio', () => { return 'https://soundcloud.com/user-555/oi'; })
  .attr('metadata', () => { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.news = news;

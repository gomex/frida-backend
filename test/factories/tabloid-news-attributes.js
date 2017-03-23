var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', () => { return faker.lorem.sentence(); })
  .attr('layout', 'tabloid_news')
  .attr('area', 'nacional')
  .attr('display_area', 'destaque_foto_grande')
  .attr('hat', 'Olimpíadas')
  .attr('description', () => { return faker.lorem.sentences(); })
  .attr('author', () => { return faker.name.findName(); })
  .attr('editor', () => { return faker.name.findName(); })
  .attr('place', () => { return faker.address.state(); })
  .attr('cover', () => { return coverAttributes.build(); });

var tabloid = new Factory()
  .attr('body', () => { return faker.lorem.paragraphs(); })
  .attr('metadata', () => { return metadata.build(); })
  .attr('audio', () => { return 'https://soundcloud.com/radioagenciabdf/oposicao-tenta-barrar-avanco-da-reforma-da-previdencia-no-congresso'; })
  .attr('regional_area', () => { return faker.lorem.word(); });

module.exports.metadata = metadata;
module.exports.tabloid = tabloid;

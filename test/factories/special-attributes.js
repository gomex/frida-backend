var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', faker.lorem.sentence)
  .attr('layout', 'special')
  .attr('description', faker.lorem.sentences)
  .attr('author', faker.name.findName)
  .attr('cover', coverAttributes.build())
  .attr('area', 'especiais');

var special = new Factory()
  .attr('metadata', metadata.build())
  .attr('tags', () => ([faker.lorem.word()]));

module.exports.metadata = metadata;
module.exports.special = special;

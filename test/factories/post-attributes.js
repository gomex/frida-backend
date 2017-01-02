var _ = require('underscore');
var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('layout', 'post')
  .attr('display_area', 'destaque_foto_grande')
  .attr('hat', 'Olimpíadas')
  .attr('description', function() { return faker.lorem.sentences(); })
  .attr('author', function() { return faker.name.findName(); })
  .attr('place', function() { return faker.address.state(); })
  .attr('cover', function() { return coverAttributes.build(); })
  .attr('most_read', faker.random.boolean)
  .attr('area', () => _.sample([
    'direitos_humanos',
    'cultura',
    'geral',
    'internacional',
    'espanol',
    'especiais',
    'opiniao',
    'politica'
  ]));

var post = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('metadata', function() { return metadata.build(); })
  .attr('published_at', function() { return faker.date.recent(); })
  .attr('tags', () => ([faker.lorem.word()]))
  .attr('audio', function() { return 'https://soundcloud.com/radioagenciabdf/oposicao-tenta-barrar-avanco-da-reforma-da-previdencia-no-congresso'; })
  .attr('related_news', () => ([]));

module.exports.metadata = metadata;
module.exports.post = post;

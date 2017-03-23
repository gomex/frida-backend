var _ = require('underscore');
var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('title', 'Título  fake')
  .attr('layout', 'post')
  .attr('display_area', 'destaque_foto_grande')
  .attr('hat', 'Olimpíadas')
  .attr('description', () => { return faker.lorem.sentences(); })
  .attr('author', () => { return faker.name.findName(); })
  .attr('editor', () => { return faker.name.findName(); })
  .attr('place', () => { return faker.address.state(); })
  .attr('cover', () => { return coverAttributes.build(); })
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
  .attr('body', () => { return faker.lorem.paragraphs(); })
  .attr('metadata', () => { return metadata.build(); })
  .attr('published_at', '2001/03/01')
  .attr('tags', () => ([faker.lorem.word()]))
  .attr('audio', () => { return 'https://soundcloud.com/radioagenciabdf/oposicao-tenta-barrar-avanco-da-reforma-da-previdencia-no-congresso'; })
  .attr('related_news', () => ([]));

module.exports.metadata = metadata;
module.exports.post = post;

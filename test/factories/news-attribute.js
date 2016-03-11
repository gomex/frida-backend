var Factory = require('rosie').Factory;
var faker = require('faker');

var cover = new Factory()
  .attr('link', function() { return faker.image.imageUrl(); })
  .attr('thumbnail', function() { return faker.image.imageUrl(); })
  .attr('medium', function() { return faker.image.imageUrl(); })
  .attr('small', function() { return faker.image.imageUrl(); })
  .attr('title', 'The picture\'s title')
  .attr('cover', true)
  .attr('credits', 'Photographer')
  .attr('subtitle', 'A beautiful picture');

var metadata = new Factory()
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('layout', 'post')
  .attr('area', 'nacional')
  .attr('display_area', 'destaque_foto_grande')
  .attr('hat', 'Olimpíadas')
  .attr('description', function() { return faker.lorem.sentences(); })
  .attr('author', function() { return faker.name.findName(); })
  .attr('place', function() { return faker.address.state(); })
  .attr('cover', function() { return cover.build(); })
  .attr('files', function() { return [cover.build() ]; });

var newsAttribute = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('metadata', function() { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.newsAttribute = newsAttribute;

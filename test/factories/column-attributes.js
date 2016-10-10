var _ = require('underscore');
var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('layout', 'column')
  .attr('columnist', () => _.sample(['brunopadron@yahoo.com.br', 'joaopedrostedile@gmail.com']))
  .attr('hat', 'Opinião')
  .attr('title', function() { return faker.lorem.sentence(); })
  .attr('display_area', 'column_01')
  .attr('description', function() { return faker.lorem.sentences(); })
  .attr('cover', function() { return coverAttributes.build(); });

var column = new Factory()
  .attr('body', function() { return faker.lorem.paragraphs(); })
  .attr('metadata', function() { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.column = column;

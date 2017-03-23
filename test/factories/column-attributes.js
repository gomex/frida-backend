var _ = require('underscore');
var Factory = require('rosie').Factory;
var faker = require('faker');
var coverAttributes = require('./cover-attributes').cover;

var metadata = new Factory()
  .attr('layout', 'column')
  .attr('columnist', () => _.sample(['brunopadron@yahoo.com.br', 'joaopedrostedile@gmail.com']))
  .attr('hat', 'Opinião')
  .attr('title', () => { return faker.lorem.sentence(); })
  .attr('display_area', 'column_01')
  .attr('description', () => { return faker.lorem.sentences(); })
  .attr('cover', () => { return coverAttributes.build(); });

var column = new Factory()
  .attr('body', () => { return faker.lorem.paragraphs(); })
  .attr('metadata', () => { return metadata.build(); });

module.exports.metadata = metadata;
module.exports.column = column;

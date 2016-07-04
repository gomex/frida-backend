var Factory = require('rosie').Factory;
var faker = require('faker');

var user = new Factory()
  .attr('name', function() { return faker.name.findName(); })
  .attr('email', function() { return faker.internet.email(); })
  .attr('hashed_password', function() { return faker.lorem.word(); });

module.exports.user = user;

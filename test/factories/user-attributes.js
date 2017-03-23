var Factory = require('rosie').Factory;
var faker = require('faker');

var user = new Factory()
  .attr('name', () => { return faker.name.findName(); })
  .attr('email', () => { return faker.internet.email(); })
  .attr('hashed_password', () => { return faker.lorem.word(); });

module.exports.user = user;

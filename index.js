require('dotenv').config();

require('./lib/db/initializer');
require('./lib/http/server').startServer();

var Home = require('./lib/models/home');
var columnistService = require('./lib/services/columnist');

Home.init((err) => {
  if (err) {
    console.error('Error Home.init', err);
  }
});

columnistService.write((err) => {
  if (err) {
    console.error('Error columnistService.write', err);
  }
});

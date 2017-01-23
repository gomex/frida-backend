require('dotenv').config();

var db = require('./lib/db/initializer');

var Home = require('./lib/models/home');
var columnistService = require('./lib/services/columnist');

db.connect(() => {
  require('./lib/http/server').startServer();
});

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

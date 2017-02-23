require('dotenv').config();
var db = require('./lib/db/initializer');
var Home = require('./lib/models/home');
var columnist = require('./lib/services/columnist');
var server = require('./lib/http/server');

function initHome() {
  Home.init((err) => {
    if (err) console.error('Error Home.init', err);
  });
}

db.connect(() => {
  initHome();
  server.start();
});

columnist.write((err) => {
  if (err) console.error('Error columnist.write', err);
});

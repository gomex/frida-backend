require('dotenv').config();

require('./lib/db/initializer');
require('./lib/columnist/columnist-repository').write(),
require('./lib/http/server').startServer();

var Home = require('./lib/models/home');

Home.init((err) => {
  if (err) {
    return console.error('Error Home.init', err);
  }
});

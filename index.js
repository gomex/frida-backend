var mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL);

mongoose.connection.once('open', function() {
  require('./lib/columnist/columnist-repository').write(),
  require('./lib/http/server').startServer();
});

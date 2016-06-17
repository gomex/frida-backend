require('dotenv').config();

require('./lib/db/initializer');
require('./lib/columnist/columnist-repository').write(),
require('./lib/http/server').startServer();

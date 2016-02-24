require('dotenv').config();

var mongoose = require('mongoose');

require('./lib/columnist/columnist-repository').write(),
require('./lib/http/server').startServer();

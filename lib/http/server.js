var express         = require('express');
var winston         = require('winston');
var compression     = require('compression');
var bodyParser      = require('body-parser');
var expressWinston  = require('express-winston');
var fs              = require('fs');
var cors            = require('./cors');
var simpleAuth      = require('./simple-auth');

var app = express();

var options = {
  cert: fs.readFileSync(process.env.CERT_FILE_PATH),
  key: fs.readFileSync(process.env.KEY_FILE_PATH)
};

var server      = require('https').createServer(options, app),
  PORT        = process.env.PORT || 5000;

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

exports.startServer = function() {
  app.use(cors);
  app.use(simpleAuth(EDITOR));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(compression());
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ]
  }));
  var auth = require('./routes/auth');
  app.use('/auth', auth);

  var columnists = require('./routes/columnists');
  app.use('/columnists', columnists);

  var news = require('./routes/news');
  app.use('/news', news);

  server.listen(PORT, function () {
    console.log('Server listening at port %d', PORT);
  });
};

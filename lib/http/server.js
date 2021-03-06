var bodyParser = require('body-parser');
var compression = require('compression');
var express = require('express');
var expressWinston = require('express-winston');
var fs = require('fs');
var winston = require('winston');
var passport = require('passport');
var auth = require('lib/http/routes/auth');
var news = require('lib/http/routes/news');
var homes = require('lib/http/routes/homes');

var authenticator = require('lib/http/authenticator');
var cors = require('lib/http/cors');

var app = express();

var options = {
  cert: fs.readFileSync(process.env.CERT_FILE_PATH),
  key: fs.readFileSync(process.env.KEY_FILE_PATH)
};

var server = require('https').createServer(options, app);
var PORT = process.env.PORT || 5000;

exports.start = () => {
  app.use(cors);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(compression());
  app.use(passport.initialize());
  app.use(authenticator);

  //routes
  app.use('/auth', auth);
  app.use('/news', news);
  app.use('/homes', homes);

  //handlers errors
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ]
  }));

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }
    console.error(err);
    res.status(err.status).json(err);
  });

  server.listen(PORT, () => {
    console.log('Server listening at port %d', PORT);
  });
};

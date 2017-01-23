var bodyParser = require('body-parser');
var compression = require('compression');
var express = require('express');
var expressWinston = require('express-winston');
var fs = require('fs');
var winston = require('winston');
var passport = require('passport');

var authenticator = require('./authenticator');
var cors = require('./cors');

var app = express();

var options = {
  cert: fs.readFileSync(process.env.CERT_FILE_PATH),
  key: fs.readFileSync(process.env.KEY_FILE_PATH)
};

var server = require('https').createServer(options, app);
var PORT = process.env.PORT || 5000;

var Acl = require('acl');

var mongoose = require('mongoose');
var acl = new Acl(new Acl.mongodbBackend(mongoose.connection.db, '3'), {debug:(msg)=>console.log(msg)});

acl.allow('options_role', '/news', 'options');
acl.addUserRoles('options_user', 'options_role');

acl.allow('editor', '/news', 'get');
acl.addUserRoles('57f6a9bbda165cc26bd1cc3c', 'editor');

var getUserId = (req) => {
  if(req.method === 'OPTIONS') {
    return 'options_user';
  } else {
    return req.user.id;
  }
}

exports.startServer = () => {
  app.use(cors);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(compression());
  app.use(passport.initialize());
  app.use(authenticator);
  app.use(acl.middleware(1, getUserId));

  //routes

  var auth = require('./routes/auth');
  app.use('/auth', auth);

  var news = require('./routes/news');
  app.use('/news', news);

  var homes = require('./routes/homes');
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
    res.status(err.status || err.errorCode).json(err);
  });

  server.listen(PORT, () => {
    console.log('Server listening at port %d', PORT);
  });
};

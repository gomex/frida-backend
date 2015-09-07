var express         = require('express'),
    compression     = require('compression'),
    bodyParser      = require('body-parser'),
    expressWinston  = require('express-winston'),
    simpleAuth      = require('./simple-auth'),
    postsRepository = require('./posts-repository')(),
    cors            = require('./cors');

var app = express();

var server      = require('http').createServer(app),
    PORT        = process.env.PORT || 5000;

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

exports.startServer = function() {
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(compression());
  app.use('/api', router);
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ]
  }));

  router.get('/organization/:organization/:repository/posts', function(req, res) {
    postsRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  router.get('/organization/:organization/:repository/posts/:id', function(req, res) {
    var data = {
      organization: req.params.organization,
      repository: req.params.repository,
      id: parseInt(req.params.id)
    };

    postsRepository.findById(data, function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  router.get('/organization/:organization/:repository/posts/:year/:month', function(req, res) {
    var data = {
      organization: req.params.organization,
      repository: req.params.repository,
      year: parseInt(req.params.year),
      month: parseInt(req.params.month)
    };

    postsRepository.findByYearAndMonth(data, function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  server.listen(PORT, function () {
    console.log('Server listening at port %d', PORT);
  });
};

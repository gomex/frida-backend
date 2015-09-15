var express         = require('express'),
    winston         = require('winston'),
    compression     = require('compression'),
    bodyParser      = require('body-parser'),
    expressWinston  = require('express-winston'),
    simpleAuth      = require('./simple-auth'),
    postsRepository = require('./posts-repository')(),
    cors            = require('./cors'),
    NotFound        = require('./not-found');

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
    var id = req.params.id;
    postsRepository.findById(id, function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  router.post('/organization/:organization/:repository/posts', function(req, res) {
    var post = req.body;
    postsRepository.insert(post, function(result) {
      res.statusCode = 201;
      res.json({ id : result });
      res.end();
    });
  });

  router.put('/organization/:organization/:repository/posts/:id', function(req, res) {
    postsRepository.updateById(req.params.id, req.body, function() {
      res.statusCode = 204;
      res.end();
    });
  });

  router.put('/organization/:organization/:repository/posts/:id/status', function(req, res) {
    postsRepository.updateById(req.params.id, req.body, function() {
      res.statusCode = 204;
      res.end();
    });
  });

  router.get('/organization/:organization/:repository/posts', function(req, res) {
    var data = {
      organization: req.params.organization,
      repository: req.params.repository,
      year: parseInt(req.query.year),
      month: parseInt(req.query.month)
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

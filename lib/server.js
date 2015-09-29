var express         = require('express'),
    winston         = require('winston'),
    compression     = require('compression'),
    bodyParser      = require('body-parser'),
    expressWinston  = require('express-winston'),
    moment          = require('moment');
    simpleAuth      = require('./simple-auth'),
    postsRepository = require('./posts-repository')(),
    cors            = require('./cors'),
    NotFound        = require('./not-found'),
    publish         = require('./publish')();

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
    postsRepository.findById(req.params.id, function(post){
      var metadata = JSON.parse(req.body.metadata);
      var title = post.metadata.title;

      post.body = req.body.body;
      post.metadata = metadata;
      post.metadata.newTitle = metadata.title;
      post.metadata.title = title;

      postsRepository.updateById(req.params.id, post, function(result) {
        res.statusCode = 200;
        res.json({ id : result });
        res.end();
      });
    });
  });

  router.put('/organization/:organization/:repository/posts/:id/status/:status', function(req, res) {
    postsRepository.findById(req.params.id, function(post){
      var date = moment(post.insertDate);
      var year = date.format('YYYY');
      var month = date.format('MM');
      var updateStatus = function(err, path){
        post.status = req.params.status;
        postsRepository.updateById(req.params.id, post, function() {
          res.statusCode = 202;
          res.json({path : path});
          res.end();
        });
      };

      if(req.params.status !== 'published'){
        return updateStatus('','');
      }

      publish.toYAML(post, req.params.id, year, month)
        .write(process.env.HEXO_POSTS_PATH, updateStatus);
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

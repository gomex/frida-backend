var express         = require('express'),
    winston         = require('winston'),
    compression     = require('compression'),
    bodyParser      = require('body-parser'),
    expressWinston  = require('express-winston'),
    moment          = require('moment');
    fs              = require('fs'),
    simpleAuth      = require('./simple-auth'),
    NotFound        = require('./not-found'),
    cors            = require('./cors'),
    postsRepository = require('../posts-repository')(),
    columnistRepository = require('../columnist-repository')(),
    publish         = require('../publisher/hexo')(),
    homeStrategy    = require('../publisher/home-strategy')(),
    PostUtil        = require('../post-util');

var app = express();
var options = {
  cert: fs.readFileSync(process.env.CERT_FILE_PATH),
  key: fs.readFileSync(process.env.KEY_FILE_PATH),
};

var server      = require('https').createServer(options, app),
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

  router.get('/organization/:organization/:repository/columnists', simpleAuth(EDITOR), function(req, res) {
    columnistRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  router.get('/organization/:organization/:repository/posts', simpleAuth(EDITOR), function(req, res) {
    postsRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  router.get('/organization/:organization/:repository/posts/:id', simpleAuth(EDITOR), function(req, res) {
    var id = req.params.id;
    postsRepository.findById(id, function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  router.post('/auth', simpleAuth(EDITOR), function(req, res) {
    return res.json({ success: true });
  });

  router.post('/organization/:organization/:repository/posts', simpleAuth(EDITOR), function(req, res) {
    var post     = PostUtil.prepare(req.body);
    postsRepository.insert(post, function(result) {
      res.statusCode = 201;
      res.json({ id : result });
      res.end();
    });
  });

  router.put('/organization/:organization/:repository/posts/:id', simpleAuth(EDITOR), function(req, res) {
    postsRepository.findById(req.params.id, function(post){
      var metadata = JSON.parse(req.body.metadata);

      post.body = req.body.body;
      post.metadata = metadata;

      postsRepository.updateById(req.params.id, post, function(result) {
        res.statusCode = 200;
        res.json({ id : result });
        res.end();
      });
    });
  });

  router.put('/organization/:organization/:repository/posts/:id/status/:status', simpleAuth(EDITOR), function(req, res) {
    postsRepository.findById(req.params.id, function(post){
      var date = moment(post.insertDate);
      var year = date.format('YYYY');
      var month = date.format('MM');
      var updateStatus = function(path){
        post.status = req.params.status;
        postsRepository.updateById(req.params.id, post, function() {
          res.statusCode = 202;
          res.json({path : path});
          res.end();
        });
      };
      var updateHome = function(layout) {
          homeStrategy.lastNews(function(homePosts) {
            publish.home(layout, homePosts).
                write(process.env.HEXO_POSTS_PATH + '/../');
          });
      };

      if(req.params.status !== 'published'){
        return updateStatus('');
      }

      publish.post(post, req.params.id, year, month)
        .write(process.env.HEXO_POSTS_PATH, function(postPath) {
            updateStatus(postPath);
            updateHome('nacional');
        });
    });
  });

  router.get('/organization/:organization/:repository/posts', simpleAuth(EDITOR), function(req, res) {
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

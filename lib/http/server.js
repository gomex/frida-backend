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
    hexo            = require('../publisher/hexo')(),
    PostUtil        = require('../post-util');

var app = express();
var options = {
  cert: fs.readFileSync(process.env.CERT_FILE_PATH),
  key: fs.readFileSync(process.env.KEY_FILE_PATH),
};

var server      = require('https').createServer(options, app),
    PORT        = process.env.PORT || 5000;

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

exports.startServer = function() {
  app.use(cors());
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

  app.get('/columnists', simpleAuth(EDITOR), function(req, res) {
    columnistRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  app.get('/posts', simpleAuth(EDITOR), function(req, res) {
    postsRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  app.get('/posts/:id', simpleAuth(EDITOR), function(req, res) {
    var id = req.params.id;
    postsRepository.findById(id, function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  });

  app.post('/auth', simpleAuth(EDITOR), function(req, res) {
    return res.json({ success: true });
  });

  app.post('/posts', simpleAuth(EDITOR), function(req, res) {
    var post     = PostUtil.prepare(req.body);
    postsRepository.insert(post, function(result) {
      res.statusCode = 201;
      res.json({ id : result });
      res.end();
    });
  });

  app.put('/posts/:id', simpleAuth(EDITOR), function(req, res) {
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

  app.put('/posts/:id/status/:status', simpleAuth(EDITOR), function(req, res) {
    postsRepository.findById(req.params.id, function(post){

      var updateStatus = function(callback){
        post.status = req.params.status;
        postsRepository.updateById(req.params.id, post, callback);
      };

      var httpResponse = function(path) {
        res.statusCode = 202;
        res.json({path : path});
        res.end();
      };

      if(req.params.status !== 'published') {
        updateStatus(function(){
          httpResponse('');
        });
      }

      post.metadata.published_at = new Date();
      hexo.publish(post, function(postPath) {
        updateStatus(function() {
          hexo.updateHome(function() {
            httpResponse(postPath);
          });
        });
      });
    });
  });

  server.listen(PORT, function () {
    console.log('Server listening at port %d', PORT);
  });
};

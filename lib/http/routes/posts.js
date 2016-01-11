var simpleAuth      = require('../simple-auth');
var postsRepository = require('../../posts-repository');
var PostUtil        = require('../../post-util');
var hexo            = require('../../publisher/hexo');

var express = require('express');

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

router.route('/')

  .get(simpleAuth(EDITOR), function(req, res) {
    postsRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  })

  .post(simpleAuth(EDITOR), function(req, res) {
    var post     = PostUtil.prepare(req.body);
    postsRepository.insert(post, function(result) {
      res.statusCode = 201;
      res.json({ id : result });
      res.end();
    });
  });

router.route('/:id')

  .get(simpleAuth(EDITOR), function(req, res) {
    var id = req.params.id;
    postsRepository.findById(id, function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  })

  .put(simpleAuth(EDITOR), function(req, res) {
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

router.route('/:id/status/:status')

  .put(simpleAuth(EDITOR), function(req, res) {
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

module.exports = router;

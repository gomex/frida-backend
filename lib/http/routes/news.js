var simpleAuth      = require('../simple-auth');
var newsRepository = require('../../news/news-repository');
var NewsUtil        = require('../../news/news-util');
var hexo            = require('../../publisher/hexo');

var express = require('express');

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

router.route('/')

  .get(simpleAuth(EDITOR), function(req, res) {
    newsRepository.getAll(function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  })

  .post(simpleAuth(EDITOR), function(req, res) {
    var news     = NewsUtil.prepare(req.body);
    newsRepository.insert(news, function(result) {
      res.statusCode = 201;
      res.json({ id : result });
      res.end();
    });
  });

router.route('/:id')

  .get(simpleAuth(EDITOR), function(req, res) {
    var id = req.params.id;
    newsRepository.findById(id, function(result) {
      res.statusCode = 200;
      res.json(result);
    });
  })

  .put(simpleAuth(EDITOR), function(req, res) {
    newsRepository.findById(req.params.id, function(news){
      var metadata = JSON.parse(req.body.metadata);

      news.body = req.body.body;
      news.metadata = metadata;

      newsRepository.updateById(req.params.id, news, function(result) {
        res.statusCode = 200;
        res.json({ id : result });
        res.end();
      });
    });
  });

router.route('/:id/status/:status')

  .put(simpleAuth(EDITOR), function(req, res) {
    newsRepository.findById(req.params.id, function(news){

      var updateStatus = function(callback){
        news.status = req.params.status;
        newsRepository.updateById(req.params.id, news, callback);
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

      news.metadata.published_at = news.metadata.published_at || new Date();
      hexo.publish(news, function(postPath) {
        updateStatus(function() {
          hexo.updateHome(function() {
            httpResponse(postPath);
          });
        });
      });
    });
  });

module.exports = router;

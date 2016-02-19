var hexo            = require('../publisher/hexo');
var newsRepository  = require('../news/news-repository');
var newsUtil        = require('../news/news-util');

var getAllNews = function(req, res) {
  newsRepository.getAll(function(result) {
    res.statusCode = 200;
    res.json(result);
  });
};

var createNews = function(req, res) {
  var news     = newsUtil.prepare(req.body);
  newsRepository.insert(news, function(result) {
    res.statusCode = 201;
    res.json({ id : result });
    res.end();
  });
};

var getNewsById =  function(req, res) {
  var id = req.params.id;
  newsRepository.findById(id, function(result) {
    res.statusCode = 200;
    res.json(result);
  });
};

var updateNews = function(req, res) {
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
};

var updateStatus = function(req, res) {
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

    news.published_at = news.published_at || new Date();
    hexo.publish(news.toObject(), function(postPath) {
      updateStatus(function() {
        hexo.updateHome(news.metadata.edition, function() {
          httpResponse(postPath);
        });
      });
    });
  });
};

module.exports = {
  updateStatus: updateStatus,
  updateNews: updateNews,
  getNewsById: getNewsById,
  createNews: createNews,
  getAllNews: getAllNews
};

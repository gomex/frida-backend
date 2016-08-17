require('dotenv').config();
require('../lib/db/initializer');
var async = require('async');
var News = require('../lib/models/news');
var hexo = require('../lib/publisher/hexo');

var publish = (news, cb) => {
  if(news.status != 'published') {
    return cb();
  }
  hexo.publish(news, cb);
};

var sleep = (cb) => {
  setTimeout(() => {
    cb();
  }, 100);
};

var update = (news, cb) => {
  console.log('republishing [%s]- "%s"', news.metadata.area, news.metadata.title);

  async.series([
    sleep,
    news.save,
    async.apply(publish, news)
  ], cb);
};

var publishAreas = (areasToUpdate) => {

  function publishAreaPage(area, callback) {
    hexo.updateAreaPage(area, (err) => {
      if(err) throw err;
      console.log('published - %s', area);
      callback();
    });
  }

  async.eachSeries(areasToUpdate, publishAreaPage, (err) => {
    if(err) throw err;
    process.exit();
  });
};

News.find({
  'status': 'published'
})
.exec((err, result) => {
  if(err) throw err;

  console.log('%s news articles found', result.length);
  var areas = {};

  var createAreaList = (item, cb) => {
    areas[item.metadata.area] = item.metadata.area;
    cb(null);
  };

  async.map(result, createAreaList, (err) => {
    if(err) throw err;
    async.eachSeries(result, update, (err) => {
      if(err) throw err;
      publishAreas(Object.keys(areas));
    });
  });
});

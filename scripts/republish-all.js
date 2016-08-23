require('dotenv').config();
require('../lib/db/initializer');
var async = require('async');
var News = require('../lib/models/news');
var hexo = require('../lib/publisher/hexo');

var publish = (news, cb) => {
  console.log('republishing [%s]- "%s"', news.metadata.area, news.metadata.title);

  async.series([
    sleep,
    async.apply(hexo.publish, news)
  ], cb);
};

var sleep = (cb) => {
  setTimeout(() => {
    cb();
  }, 100);
};

News.find({
  'status': 'published'
})
.exec((err, result) => {
  if(err) throw err;

  console.log('%s news articles found', result.length);

  async.eachSeries(result, publish, (err) => {
    if(err) throw err;

    process.exit();
  });
});

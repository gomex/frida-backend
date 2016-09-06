require('dotenv').config();
require('../lib/db/initializer');
var async = require('async');
var News = require('../lib/models/news');
var publisher = require('../lib/models/publisher');

var publishSecure = (news, cb) => {
  try {
    publisher.publish(news, cb);
  } catch (e) {
    console.log(e);
    console.log(news);
    cb();
  }
};

var publish = (news, cb) => {
  console.log('republishing [%s]- "%s"', news.metadata.area, news.metadata.title);
  news.status = 'draft';
  async.series([
    news.save,
    sleep,
    async.apply(publishSecure, news)
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

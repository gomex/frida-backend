require('dotenv').config();
var db = require('../db/initializer');
var async = require('async');
var News = require('../lib/models/news');
var hexo = require('../lib/publisher/hexo');

var source = process.argv[2];
var dest = process.argv[3];

var publish = (news, cb) => {
  if(news.isDraft()) {
    return cb();
  }

  console.log('republishing');
  hexo.publish(news, cb);
};

var sleep = (cb) => {
  setTimeout(() => {
    cb();
  }, 100);
};

var update = (news, cb) => {
  console.log('updating - "%s"', news.metadata.title);
  news.metadata.area = dest;

  async.series([
    sleep,
    news.save,
    async.apply(publish, news)
  ], cb);
};

var publishArea = () => {
  console.log('publishing area "%s"', dest);
  hexo.updateAreaPage(dest, (err) => {
    if(err) throw err;

    console.log('published');
    process.exit();
  });
};

db.connect((connection) => {
  News.find({
    'metadata.area': source
  })
  .exec((err, result) => {
    if(err) throw err;

    console.log('%s news found', result.length);

    async.eachSeries(result, update, (err) => {
      if(err) throw err;

      publishArea();
    });
  });
});

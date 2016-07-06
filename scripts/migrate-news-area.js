require('dotenv').config();
require('../lib/db/initializer');
var async = require('async');
var News = require('../lib/models/news');
var hexo = require('../lib/publisher/hexo');

var source = process.argv[2];
var dest = process.argv[3];

console.log(process.argv);

var publish = (news, cb) => {
  if(news.status == 'draft') {
    return cb();
  }

  console.log('republishing');
  hexo.publish(news, cb);
};

var update = (news, cb) => {
  console.log('updating - "%s"', news.metadata.title);
  news.metadata.area = dest;

  async.series([
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
  })
};

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
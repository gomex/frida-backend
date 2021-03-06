var News = require('lib/models/news');
var worker = require('lib/services/publisher/worker');

function getPublisheds(callback) {
  News.find()
    .where('status').equals('published')
    .sort('-published_at')
    .exec(callback);
}

function publish(callback) {
  getPublisheds((err, results) => {
    if (err) {
      console.error('REPUBLISHER', err);
      return callback(err);
    }
    console.info('REPUBLISHER', 'publishing', results.length);
    worker.publishLater(results, false, callback);
  });
}

module.exports = {
  publish
};

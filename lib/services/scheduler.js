var News = require('lib/models/news');
var worker = require('lib/services/publisher/worker');

function getScheduleds(callback) {
  News.find()
    .where('status').equals('scheduled')
    .where('published_at').lte(new Date())
    .exec(callback);
}

function publish(callback) {
  getScheduleds((err, results) => {
    if (err) {
      console.error('SCHEDULER', err);
      return callback(err);
    }
    if (results.length) console.info('SCHEDULER', 'publishing', results.length);
    worker.publishLater(results, true, callback);
  });
}

module.exports = {
  publish
};

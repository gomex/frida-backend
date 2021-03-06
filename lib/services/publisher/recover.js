var News = require('lib/models/news');
var worker = require('lib/services/publisher/worker');

function getPublishing(callback) {
  News.find()
    .where('status').equals('publishing')
    .exec(callback);
}

function publish(callback) {
  getPublishing((err, results) => {
    if (err) {
      console.error('RECOVER', err);
      return callback(err);
    }
    console.info('RECOVER', 'publishing', results.length);
    worker.publishLater(results, false, callback);
  });
}

module.exports = {
  publish
};

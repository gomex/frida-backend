var News = require('../../models/news');
var publisher = require('../../models/publisher');

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
    publisher.publishLater(results, false, callback);
  });
}

module.exports = {
  publish
};

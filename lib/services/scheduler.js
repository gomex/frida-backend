var News = require('../models/news');
var publisher = require('../models/publisher');

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
    publisher.publishLater(results, true, callback);
  });
}

module.exports = {
  publish
};

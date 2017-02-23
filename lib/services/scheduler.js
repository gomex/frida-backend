var News = require('../models/news');
var publisher = require('../models/publisher');
var async = require('async');

function getScheduledNews(callback) {
  News.find()
    .where('status').equals('scheduled')
    .where('published_at').lte(new Date())
    .exec(callback);
}

function publish(callback) {
  getScheduledNews((err, result) => {
    if (err) {
      console.error('SCHEDULER', err);
      return callback(err);
    }
    if (!result.length) return callback();

    console.info('SCHEDULER', 'publishing', result.length);

    async.each(result, publisher.publishLater, callback);
  });
}

module.exports = {
  publish
};

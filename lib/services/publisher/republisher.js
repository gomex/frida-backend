var News = require('../../models/news');
var publisher = require('../../models/publisher');
var async = require('async');

function getPublisheds(callback) {
  News.find()
    .where('status').equals('published')
    .sort('-published_at')
    .exec(callback);
}

function publish(callback) {
  getPublisheds((err, result) => {
    if (err) {
      console.error('REPUBLISHER', err);
      return callback(err);
    }
    if (!result.length) return callback();

    console.info('REPUBLISHER', 'publishing', result.length);

    async.each(result, publisher.publishLater, callback);
  });
}

module.exports = {
  publish
};

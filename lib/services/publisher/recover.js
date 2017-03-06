var News = require('../../models/news');
var publisher = require('../../models/publisher');
var async = require('async');

function getScheduledNews(callback) {
  News.find()
    .where('status').equals('publishing')
    .exec(callback);
}

function publish(callback) {
  getScheduledNews((err, result) => {
    if (err) {
      console.error('RECOVER', err);
      return callback(err);
    }
    if (!result.length) return callback();

    console.info('RECOVER', 'publishing', result.length);

    async.each(result, publisher.publishLater, callback);
  });
}

module.exports = {
  publish
};

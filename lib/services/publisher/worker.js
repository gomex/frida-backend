var News = require('../../models/news');
var publisher = require('../../models/publisher');
var hexoSource = require('../../publisher/hexo_source');
var hexo = require('../../publisher/hexo');
var parallel = require('async').parallel;
var async = require('async');
var series = require('async').series;
var apply = require('async').apply;
var _ = require('underscore');

var publisherCargo = async.cargo(run, 100);

function publishLater(news, priority, callback) {
  if (!news.length) return callback();

  var ids = _.pluck(news, '_id');
  News.where('_id').in(ids).updateMany({ status: 'publishing' }).exec((err) => {
    if (err) return callback(err);

    var add = priority ? publisherCargo.unshift : publisherCargo.push;
    add(ids, (err) => {
      if (err) console.error('PUBLISHER', err);
    });

    callback();
  });
}

function unpublishLater(news, callback) {
  news.status = 'unpublishing';

  news.save((err, news) => {
    if(err) return callback(err);

    publisherCargo.push(news._id, (err) => {
      if(err) console.error('UNPUBLISHER ', err);
    });

    callback(null, news);
  });
}

function run(tasks, callback) {
  newsByIds(tasks, (err, results) => {
    if (err) return callback(err);

    var byStatus = _.groupBy(results, 'status');
    series([
      hexoSource.removePosts,
      apply(publishNews, byStatus),
      publishSite
    ], callback);
  });
}

function newsByIds(ids, callback) {
  News.find().where('_id').in(ids).exec(callback);
}

function publishNews(byStatus, callback) {
  parallel([
    apply(publisher.publishNew, byStatus['publishing']),
    apply(publisher.unpublishNew, byStatus['unpublishing'])
  ], callback);
}

function publishSite(callback) {
  parallel([
    publisher.publishLists,
    publisher.publishHomes,
  ], (err) => {
    if (err) return callback(err);

    hexo.generate('publish', callback);
  });
}

module.exports = {
  run,
  publishLater,
  unpublishLater
};

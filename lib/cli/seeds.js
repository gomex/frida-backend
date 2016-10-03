var postFactory = require('../../test/factories/post-attributes').post;
var postMetadataFactory = require('../../test/factories/post-attributes').metadata;
var News = require('../models/news');
var publisher = require('../models/publisher');
var async = require('async');
// var mongoose = require('mongoose');
var rmdir = require('rmdir');
var path = require('path');
var fs = require('fs');

function execute(callback) {
  async.series([
    // dropDatabase,
    removeSiteSource,
    async.apply(createPost, 'featured_01'),
    async.apply(createPost, 'featured_02'),
    async.apply(createPost, 'featured_03'),
    async.apply(createPost, 'featured_04'),
    async.apply(createPost, 'featured_05'),
    async.apply(createPost, 'featured_06'),
    async.apply(createPost, 'featured_07'),
    async.apply(createPost, 'featured_08')
  ], callback);
}

function removeSiteSource(callback) {
  async.each(fs.readdirSync(process.env.HEXO_SOURCE_PATH), (name, callback) => {
    var dir = path.join(process.env.HEXO_SOURCE_PATH, name);
    rmdir(dir, callback);
  }, callback);
}

// not dropping without check ENVIROMENT
// function dropDatabase(callback) {
//   mongoose.connection.once('open', (err) => {
//     if(err) return callback(err);
//
//     mongoose.connection.db.dropDatabase(callback);
//   });
// }

function createPost(displayArea, callback) {
  var metadata = postMetadataFactory.build({display_area: displayArea});
  var post = new News(postFactory.build({metadata: metadata}));

  post.status = 'draft';
  post.created_at = Date.now();
  post.updated_at = Date.now();

  post.save((err, post) => {
    publisher.publish(post, callback);
  });
}

module.exports = {
  execute
};

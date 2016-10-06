var postFactory = require('../../test/factories/post-attributes').post;
var postMetadataFactory = require('../../test/factories/post-attributes').metadata;
var News = require('../models/news');
var publisher = require('../models/publisher');
var async = require('async');
var rmdir = require('rmdir');
var path = require('path');
var fs = require('fs');

function execute(callback) {
  if (checkEnvironment(callback)) return;

  async.series([
    dropNewsOnDatabase,
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

function checkEnvironment(callback) {
  if (process.env.NODE_ENV != 'local') {
    return callback(
      `Only run this command on local environment. NODE_ENV: ${process.env.NODE_ENV}`
    );
  }
}

function removeSiteSource(callback) {
  async.each(fs.readdirSync(process.env.HEXO_SOURCE_PATH), (name, callback) => {
    var dir = path.join(process.env.HEXO_SOURCE_PATH, name);
    rmdir(dir, callback);
  }, callback);
}

function dropNewsOnDatabase(callback) {
  News.remove({}, callback);
}

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

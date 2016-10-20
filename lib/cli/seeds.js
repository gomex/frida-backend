var postFactory = require('../../test/factories/post-attributes').post;
var columnFactory = require('../../test/factories/column-attributes').column;
var tabloidFactory = require('../../test/factories/tabloid-attributes').tabloid;
var advertisingFactory = require('../../test/factories/advertising-attributes').advertising;
var spotlightFactory = require('../../test/factories/spotlight-attributes').spotlight;
var photoCaptionFactory = require('../../test/factories/photo-caption-attributes').photoCaption;
var postMetadataFactory = require('../../test/factories/post-attributes').metadata;
var columnMetadataFactory = require('../../test/factories/column-attributes').metadata;
var tabloidMetadataFactory = require('../../test/factories/tabloid-attributes').metadata;
var advertisingMetadataFactory = require('../../test/factories/advertising-attributes').metadata;
var spotlightMetadataFactory = require('../../test/factories/spotlight-attributes').metadata;
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

    createPostToAreas,

    async.apply(createPost, 'featured_01'),
    async.apply(createPost, 'featured_02'),
    async.apply(createPost, 'featured_03'),
    async.apply(createPost, 'featured_04'),
    async.apply(createPost, 'featured_05'),
    async.apply(createPost, 'featured_06'),
    async.apply(createPost, 'featured_07'),
    async.apply(createPost, 'featured_08'),

    async.apply(createColumn, 'column_01'),
    async.apply(createColumn, 'column_02'),
    async.apply(createColumn, 'column_03'),

    async.apply(createTabloid, 'tabloid_ce'),
    async.apply(createTabloid, 'tabloid_mg'),
    async.apply(createTabloid, 'tabloid_pr'),
    async.apply(createTabloid, 'tabloid_pe'),
    async.apply(createTabloid, 'tabloid_rj'),

    async.apply(createAdvertising, 'advertising_01'),
    async.apply(createAdvertising, 'advertising_02'),
    async.apply(createAdvertising, 'advertising_03'),
    async.apply(createAdvertising, 'advertising_04'),
    async.apply(createAdvertising, 'advertising_05'),
    async.apply(createAdvertising, 'advertising_06'),

    async.apply(createSpotlight, 'spotlight_01'),
    async.apply(createSpotlight, 'spotlight_02'),

    createPhotoCaptions
  ], callback);
}

function createPhotoCaptions(callback) {
  async.times(20, (n, callback) => {
    createPhotoCaption(callback);
  }, callback);
}

function createPostToAreas(callback) {
  console.log('creating posts');

  async.times(200, (n, callback) => {
    createPost('none', callback);
  }, callback);
}

function checkEnvironment(callback) {
  if (process.env.NODE_ENV != 'local') {
    return callback(
      `Only run this command on local environment. NODE_ENV: ${process.env.NODE_ENV}`
    );
  }
}

function removeSiteSource(callback) {
  console.log('removing site source');

  async.each(fs.readdirSync(process.env.HEXO_SOURCE_PATH), (name, callback) => {
    var dir = path.join(process.env.HEXO_SOURCE_PATH, name);
    rmdir(dir, callback);
  }, callback);
}

function dropNewsOnDatabase(callback) {
  console.log('dropping news on database');

  News.remove({}, callback);
}

function createAdvertising(displayArea, callback) {
  var metadata = advertisingMetadataFactory.build({display_area: displayArea});
  var advertising = new News(advertisingFactory.build({metadata: metadata}));

  createNews(advertising, callback);
}

function createSpotlight(displayArea, callback) {
  var metadata = spotlightMetadataFactory.build({display_area: displayArea});
  var spotlight = new News(spotlightFactory.build({metadata: metadata}));

  createNews(spotlight, callback);
}

function createPhotoCaption(callback) {
  var photoCaption = new News(photoCaptionFactory.build());

  createNews(photoCaption, callback);
}

function createTabloid(displayArea, callback) {
  var metadata = tabloidMetadataFactory.build({display_area: displayArea});
  var tabloid = new News(tabloidFactory.build({metadata: metadata}));

  createNews(tabloid, callback);
}

function createPost(displayArea, callback) {
  var metadata = postMetadataFactory.build({display_area: displayArea});
  var post = new News(postFactory.build({metadata: metadata}));

  createNews(post, callback);
}

function createColumn(displayArea, callback){
  var metadata = columnMetadataFactory.build({display_area: displayArea});
  var column = new News(columnFactory.build({metadata: metadata}));

  createNews(column, callback);
}

function createNews(news, callback){
  news.status = 'draft';

  news.save((err, news) => {
    publisher.publish(news, callback);
  });
}

module.exports = {
  execute
};
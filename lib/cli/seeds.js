var testPostFactory = require('../../test/factories/test-post-attributes').post;
var postFactory = require('../../test/factories/post-attributes').post;
var columnFactory = require('../../test/factories/column-attributes').column;
var tabloidFactory = require('../../test/factories/tabloid-attributes').tabloid;
var tabloidNewsFactory = require('../../test/factories/tabloid-news-attributes').tabloid;
var advertisingFactory = require('../../test/factories/advertising-attributes').advertising;
var spotlightFactory = require('../../test/factories/spotlight-attributes').spotlight;
var photoCaptionFactory = require('../../test/factories/photo-caption-attributes').photoCaption;
var testPostMetadataFactory = require('../../test/factories/test-post-attributes').metadata;
var postMetadataFactory = require('../../test/factories/post-attributes').metadata;
var columnMetadataFactory = require('../../test/factories/column-attributes').metadata;
var tabloidMetadataFactory = require('../../test/factories/tabloid-attributes').metadata;
var advertisingMetadataFactory = require('../../test/factories/advertising-attributes').metadata;
var spotlightMetadataFactory = require('../../test/factories/spotlight-attributes').metadata;
var News = require('../models/news');
var Home = require('../models/home');
var publisher = require('../models/publisher');
var async = require('async');
var rmdir = require('rmdir');
var path = require('path');
var fs = require('fs');
var columnists = require('../services/columnist');
var homePublisher = require('../services/publisher/home');
var hexo = require('../publisher/hexo');
var sinon = require('sinon');

function execute(callback) {
  if (checkEnvironment(callback)) return;

  var sandbox = sinon.sandbox.create();
  sandbox.stub(hexo, 'generate').yields();

  async.series([
    dropNewsOnDatabase,
    removeSiteSource,
    Home.init,
    createPostToAreas,
    createTabloids,
    createTabloidNews,
    columnists.write,
    createHome,
    createPhotoCaptions,
    createAdvertisings,
    createRadioagenciaHome,
    createTestPost,
    publisher.publishLists,
    homePublisher.publishAll,
  ], callback);
}

function createRadioagenciaHome(callback) {
  console.log('creating radioagencia home');

  async.parallel({
    featured_01: (callback) => createPost({tags: ['radioagencia']}, callback),
    service_01: (callback) => createPost({tags: ['hojenahistoria']}, callback),
    service_02: (callback) => createPost({tags: ['alimentoesaude']}, callback),
    service_03: (callback) => createPost({tags: ['nossosdireitos']}, callback),
    service_04: (callback) => createPost({tags: ['fatoscuriosos']}, callback),
    service_05: (callback) => createPost({tags: ['mosaicocultural']}, callback),
    latest_news: (callback) => createRadioagenciaPosts(callback)
  }, (err, results) => {
    if (err) return callback(err);

    Home.findOneAndUpdate({name: 'radio_agencia'}, results, {new: true}, (err, home) => {
      if (err) return callback(err);
      homePublisher.publish(home, callback);
    });
  });
}

function createRadioagenciaPosts(callback) {
  console.log('creating radioagencia posts');

  async.timesSeries(20, (n, callback) => {
    createPost({ tags: ['radioagencia'] }, callback);
  }, callback);
}

function createHome(callback) {
  console.log('creating home');

  async.parallel({
    featured_01: (callback) => createPost(null, callback),
    featured_02: (callback) => createPost(null, callback),
    featured_03: (callback) => createPost(null, callback),
    featured_04: (callback) => createPost(null, callback),
    featured_05: (callback) => createPost(null, callback),
    featured_06: (callback) => createPost(null, callback),
    featured_07: (callback) => createPost(null, callback),
    featured_08: (callback) => createPost(null, callback),
    featured_09: (callback) => createPost(null, callback),
    featured_10: (callback) => createPost(null, callback),
    featured_11: (callback) => createPost(null, callback),
    featured_12: (callback) => createPost(null, callback),

    column_01: (callback) => createColumn(null, callback),
    column_02: (callback) => createColumn(null, callback),
    column_03: (callback) => createColumn(null, callback),

    photo_caption: (callback) => createPhotoCaption(callback),

    spotlight_01: (callback) => createSpotlight(null, callback),
    spotlight_02: (callback) => createSpotlight(null, callback),
    spotlight_03: (callback) => createSpotlight(null, callback),

    mostread_01: (callback) => createPost(null, callback),
    mostread_02: (callback) => createPost(null, callback),
    mostread_03: (callback) => createPost(null, callback),
    mostread_04: (callback) => createPost(null, callback),
    mostread_05: (callback) => createPost(null, callback)
  }, (err, results) => {
    if (err) return callback(err);

    Home.findOneAndUpdate({name: 'bdf'}, results, {new: true}, (err, home) => {
      if (err) return callback(err);
      homePublisher.publish(home, callback);
    });
  });
}

function createPhotoCaptions(callback) {
  console.log('creating photo-captions');

  async.timesSeries(20, (n, callback) => {
    createPhotoCaption(callback);
  }, callback);
}

function  createAdvertisings(callback) {
  console.log('creating advertisings');

  async.parallel([
    async.apply(createAdvertising, 'advertising_01'),
    async.apply(createAdvertising, 'advertising_02'),
    async.apply(createAdvertising, 'advertising_03'),
    async.apply(createAdvertising, 'advertising_04'),
    async.apply(createAdvertising, 'advertising_05')
  ], callback);
}

function createTabloids(callback) {
  console.log('creating tabloids');

  async.timesSeries(4, (n, callback) => {
    async.parallel([
      async.apply(createTabloid, 'tabloid_ce'),
      async.apply(createTabloid, 'tabloid_pe'),
      async.apply(createTabloid, 'tabloid_pr'),
      async.apply(createTabloid, 'tabloid_rj'),
      async.apply(createTabloid, 'tabloid_mg'),
    ], callback);
  }, callback);
}

function  createTabloidNews(callback) {
  console.log('creating tabloids news');

  async.timesSeries(20, (n, callback) => {
    async.parallel([
      async.apply(createTabloidNew, 'tabloid_ce'),
      async.apply(createTabloidNew, 'tabloid_pe'),
      async.apply(createTabloidNew, 'tabloid_pr'),
      async.apply(createTabloidNew, 'tabloid_rj'),
      async.apply(createTabloidNew, 'tabloid_mg'),
    ], callback);
  }, callback);
}

function createPostToAreas(callback) {
  console.log('creating posts');

  async.timesSeries(200, (n, callback) => {
    createPost(null, callback);
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

  async.series([
    (callback) => News.remove({}, callback),
    (callback) => Home.remove({}, callback)
  ], callback);
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

function createPost(options, callback) {
  options = options || {};
  options.metadata = postMetadataFactory.build();
  var post = new News(postFactory.build(options));

  createNews(post, callback);
}

function createTestPost(callback) {
  console.log('creating test post');

  var options = {};
  options.metadata = testPostMetadataFactory.build();
  var post = new News(testPostFactory.build(options));

  createNews(post, callback);
}

function createTabloidNew(region, callback) {
  var tabloidNew = new News(tabloidNewsFactory.build({region: region}));

  createNews(tabloidNew, callback);
}


function createColumn(displayArea, callback){
  var metadata = columnMetadataFactory.build({display_area: displayArea});
  var column = new News(columnFactory.build({metadata: metadata}));

  createNews(column, callback);
}

function createNews(news, callback){
  news.status = 'draft';

  news.save((err, news) => {
    publisher.publishOne(news, (err) => {
      callback(err, news);
    });
  });
}

module.exports = {
  execute
};

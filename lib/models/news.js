'use strict';

var moment = require('moment');
var slug = require('slug');
var path = require('path');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var async = require('async');

function handleEmptyValue(v) {
  return v == '' ? null : v;
}

var schema = mongoose.Schema(
  {
    'metadata': {
      'layout': String,
      'display_area': String,
      'area': String,
      'hat': String,
      'title': String,
      'description': String,
      'author': String,
      'editor': String,
      'columnist': String,
      'place': String,
      'url': String,
      'most_read': Boolean,
      'cover': {
        'link': String,
        'original': String,
        'thumbnail': String,
        'medium': String,
        'small': String,
        'title': String,
        'credits': String,
        'subtitle': String,
        'mobile': Object
      }
    },
    'image': String,
    'link': String,
    'body': String,
    'status': String,
    'issuu': String,
    'edition': String,
    'region': String,
    'regional_area': String,
    'related_news': [{ type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue }],
    'tags': { type: [String] },
    'audio': String,
    'sections': [{}],
    'tabloid': { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    'published_at': { type: Date, index: true }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

schema.methods.isPost = function() {
  return this.metadata.layout == 'post';
};

schema.methods.isColumn = function() {
  return this.metadata.layout == 'column';
};

schema.methods.isTabloid = function() {
  return this.metadata.layout == 'tabloid';
};

schema.methods.isTabloidNews = function() {
  return this.metadata.layout == 'tabloid_news';
};

schema.methods.isPhotoCaption = function() {
  return this.metadata.layout == 'photo_caption';
};

schema.methods.isAdvertising = function() {
  return this.metadata.layout == 'advertising';
};

schema.methods.isSpotlight = function() {
  return this.metadata.layout == 'spotlight';
};

schema.methods.isSpecial = function() {
  return this.metadata.layout == 'special';
};

schema.methods.isDraft = function() {
  return this.status == 'draft';
};

schema.methods.isChanged = function() {
  return this.status == 'changed';
};

schema.methods.isPublished = function() {
  return this.status == 'published';
};

schema.methods.isScheduled = function() {
  return this.status == 'scheduled';
};

schema.methods.isPublishing = function() {
  return this.status == 'publishing';
};

schema.pre('save', function(callback) {
  this.increment();
  callback();
});

schema.methods.updateSanitized = function(attributes, cb) {
  Object.assign(this.metadata, _.omit(attributes.metadata, 'url'));
  Object.assign(this, _.omit(attributes, ['created_at', 'metadata']));

  if (this.metadata.cover && !this.metadata.cover.link) {
    this.metadata.cover = null;
  }

  if (this.status === 'published') {
    this.status = 'changed';
  }

  this.updated_at = Date.now();

  News.removeLineSeparator(this);

  this.save(cb);
};

schema.methods.generateUrl = function() {
  if(this.metadata.url) return;

  var slugTitle = slug(this.metadata.title, { lower: true });
  var url;

  if(this.isSpecial()) {
    url = path.join('/especiais', slugTitle, '/');
  } else {
    var urlBase = (this.isPhotoCaption()) ? '/charges' : '/';
    var publishedAt = moment(this.published_at);
    var postDir = publishedAt.format('YYYY/MM/DD');
    url = path.join(urlBase, postDir, slugTitle, '/');
  }

  this.metadata.url = url;
};

schema.query.byArea = function(area) {
  return this
    .where('metadata.area').equals(area)
    .byLayouts(['post', 'tabloid_news', 'special']);
};

schema.query.byRegion = function(region) {
  return this
    .where('region').equals(region)
    .byLayouts('tabloid_news');
};

schema.query.byColumnist = function(columnist) {
  return this
    .where('metadata.columnist').equals(columnist)
    .byLayouts('column');
};

schema.query.byLayouts = function(layouts) {
  return this
    .where('metadata.layout').in(layouts);
};

schema.query.byService = function(service) {
  var tags = (service == 'programasemanal') ?
    ['programasp', 'programape'] : [service];

  return this
    .byLayouts(['post', 'tabloid_news'])
    .where('tags').in(tags);
};

schema.query.publisheds = function() {
  return this.where('status').equals('published');
};

schema.query.byMonth = function(year, month) {
  var startDate = new Date(year, month, 1);
  var endDate = moment([year,month]).endOf('month');
  return this
    .where('published_at').gte(startDate).lte(endDate);
};

var News = mongoose.model('News', schema);

News.getAreaListPath = function(area) {
  return area;
};

News.getRegionalListPath = function(region) {
  return {
    'tabloid_rj': 'rio-de-janeiro',
    'tabloid_mg': 'minas-gerais',
    'tabloid_pr': 'parana',
    'tabloid_ce': 'ceara',
    'tabloid_pe': 'pernambuco'
  }[region];
};

News.getPhotoCaptionListPath = function() {
  return 'charges';
};

News.getLastNewsListPath = function() {
  return 'ultimas_noticias';
};

News.getServiceListPath = function(service) {
  var paths = {
    alimentoesaude: 'alimento-e-saude',
    nossosdireitos: 'nossos-direitos',
    fatoscuriosos: 'fatos-curiosos',
    mosaicocultural: 'mosaico-cultural',
    programasemanal: 'programa-semanal',
    conectados: 'conectados',
    momentoagroecologico: 'momento-agroecologico',
    falaai: 'fala-ai'
  };
  return `radioagencia/${paths[service]}`;
};

News.findNews = function find(query, projection, limit, sort, callback) {
  var pipeline = [];

  pipeline.push({ '$match': query });

  if(sort) {
    pipeline.push({ '$sort': sort });
  }
  if(limit) {
    pipeline.push({ '$limit': limit });
  }
  if(projection) {
    pipeline.push({ '$project': projection });
  }

  News.aggregate(pipeline, callback);
};

News.findOtherNews = (news, callback) => {
  async.waterfall([
    async.apply(findOtherNewsByHat, news),
    findOtherNewsByArea
  ], callback);
};

News.removeLineSeparator = (news) => {

  if(news.body !== undefined) {
    news.body = news.body.replace(/\u2028/g, '\n');
  }

  news.metadata.title = news.metadata.title.replace(/\u2028/g, '');
};

News.on('index', (error) => {
  if (error) {
    console.error('NEWS', 'indexes', error.message);
  } else {
    console.info('NEWS', 'indexes', 'created');
  }
});

const OTHER_NEWS_LIMIT = 3;

var findOtherNewsByHat = (news, callback) => {
  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'}
    ],
    'metadata.hat': news.metadata.hat,
    'metadata.title': { $ne: news.metadata.title }
  };

  var options = {
    limit: OTHER_NEWS_LIMIT,
    sort: '-published_at'
  };

  News.find(query, null, options, (err, result) => {
    callback(err, news, result);
  });
};

var findOtherNewsByArea = (news, newsByHat, callback) => {
  if (newsByHat && newsByHat.length == OTHER_NEWS_LIMIT)
    return callback(null, newsByHat);

  var query = {
    'status': 'published',
    $or: [
      {'metadata.layout': 'post'},
      {'metadata.layout': 'tabloid_news'}
    ],
    'metadata.area': news.metadata.area,
    'metadata.hat': { $ne: news.metadata.hat },
    'metadata.title': { $ne: news.metadata.title }
  };

  var options = {
    limit: OTHER_NEWS_LIMIT - newsByHat.length,
    sort: '-published_at'
  };

  News.find(query, null, options, (err, newsByArea) => {
    callback(err, newsByHat.concat(newsByArea));
  });
};

module.exports = News;

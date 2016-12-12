'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');
var async = require('async');

function handleEmptyValue(v) {
  return v == '' ? null : v;
}

var newsSchema = mongoose.Schema(
  {
    'metadata': {
      'layout': String,
      'display_area': String,
      'area': String,
      'hat': String,
      'title': String,
      'description': String,
      'author': String,
      'columnist': String,
      'place': String,
      'url': String,
      'most_read': Boolean,
      'cover': {
        'link': String,
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
    'published_at': Date
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

newsSchema.methods.isPost = function() {
  return this.metadata.layout == 'post';
};

newsSchema.methods.isColumn = function() {
  return this.metadata.layout == 'column';
};

newsSchema.methods.isTabloid = function() {
  return this.metadata.layout == 'tabloid';
};

newsSchema.methods.isTabloidNews = function() {
  return this.metadata.layout == 'tabloid_news';
};

newsSchema.methods.isPhotoCaption = function() {
  return this.metadata.layout == 'photo_caption';
};

newsSchema.methods.isAdvertising = function() {
  return this.metadata.layout == 'advertising';
};

newsSchema.methods.isSpotlight = function() {
  return this.metadata.layout == 'spotlight';
};

newsSchema.methods.isSpecial = function() {
  return this.metadata.layout == 'special';
};

newsSchema.methods.isDraft = function() {
  return this.status == 'draft';
};

newsSchema.methods.isChanged = function() {
  return this.status == 'changed';
};

newsSchema.methods.isPublished = function() {
  return this.status == 'published';
};

newsSchema.pre('save', function(callback) {
  this.increment();
  callback();
});

newsSchema.methods.updateSanitized = function(attributes, cb) {
  Object.assign(this.metadata, _.omit(attributes.metadata, 'url'));
  Object.assign(this, _.omit(attributes, ['status', 'created_at', 'published_at', 'metadata']));

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

var News = mongoose.model('News', newsSchema);

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

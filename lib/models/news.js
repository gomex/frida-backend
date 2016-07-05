'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');

var newsSchema = mongoose.Schema({
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
    'cover': {
      'link': String,
      'thumbnail': String,
      'medium': String,
      'small': String,
      'title': String,
      'credits': String,
      'subtitle': String
    },
    'url': String,
    'most_read': Boolean
  },
  'image': String,
  'link': String,
  'body': String,
  'status': String,
  'issuu': String,
  'edition': String,
  'region': String,
  'regional_area': String,
  'published_at': Date,
  'created_at': Date,
  'updated_at': Date
});

newsSchema.methods.isTabloid = function() {
  return this.metadata.layout === 'tabloid';
};

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

module.exports = News;
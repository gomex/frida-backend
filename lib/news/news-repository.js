'use strict';

var _           = require('underscore');
var mongoose    = require('mongoose');

var connectionOptions = {
  server: { socketOptions: {keepAlive: 120} }
};

mongoose.connect(process.env.DATABASE_URL, connectionOptions);

mongoose.connection.once('open', function() {
  console.log('Connection to MongoDB successfully opened.');
});

mongoose.connection.on('error', function() {
  console.error('Failed to connect to MongoDB. Exiting...');
  process.exit(1);
});

mongoose.connection.on('disconnected', function() {
  console.log('Disconnected from MongoDB.');
});

mongoose.connection.on('reconnected', function() {
  console.log('Reconnected to MongoDB.');
});

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

var FRIDA_FRONTEND_NEWS_LIMIT = 50;

module.exports =
{
  news: News,

  getAll: function(query, callback) {
    News.find(query).sort('-created_at').limit(FRIDA_FRONTEND_NEWS_LIMIT).exec(function(err, news) {
      callback(err, news);
    });
  },

  insert: function(newItem, callback) {
    var news = new News(newItem);
    news.save(function(err){
      callback(err, news._id.toString());
    });
  },

  findById: function(id, callback) {
    News.findById(id, function(err, news){
      callback(err, news);
    });
  },

  find: function(criteria, projection, limit, sort, callback) {
    var pipeline = [];

    pipeline.push({ '$match': criteria });

    if(sort) {
      pipeline.push({ '$sort': sort });
    }
    if(limit) {
      pipeline.push({ '$limit': limit });
    }
    if(projection) {
      pipeline.push({ '$project': projection });
    }

    News.aggregate(pipeline).exec(callback);
  },

  deleteById: function(id, callback) {
    News.remove({_id: id}, function(err){
      callback(err);
    });
  },

  updateById: function(id, item, callback) {
    var updatedItem = _.clone(item);
    delete updatedItem._id;

    News.findOneAndUpdate({_id: id}, {$set: updatedItem}, {new: true}, function(err, updated){
      callback(err, updated);
    });
  },

  deleteAll: function(callback) {
    News.remove({}, function(err) {
      callback(err);
    });
  }
};

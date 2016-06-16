'use strict';

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

module.exports = { news: News };

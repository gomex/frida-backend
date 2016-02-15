'use strict';

var assert      = require('assert');
var mongoose    = require('mongoose');
var ObjectId    = require('mongodb').ObjectId;

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
  "metadata": {
      "date": Date,
      "layout": String,
      "edition": String,
      "area": String,
      "hat": String,
      "title": String,
      "description": String,
      "author": String,
      "columnist": String,
      "place": String,
      "cover": {
          "link": String,
          "thumbnail": String,
          "medium": String,
          "small": String,
          "title": String,
          "cover": Boolean,
          "credits": String,
          "subtitle": String
      },
      "files": [{
          "link": String,
          "thumbnail": String,
          "medium": String,
          "small": String,
          "title": String,
          "cover": Boolean,
          "credits": String,
          "subtitle": String
      }],
      "created_date": Date,
      "url": String
  },
  "body": String,
  "insertDate": Date,
  "status": String,
  "published_at": Date
});

var News = mongoose.model('News', newsSchema);

module.exports =
{

  getAll: function(callback) {
    News.find({}, function(err, news){
      assert.equal(null, err, 'Could not retrieve news from the database: ' + err);

      callback(news);
    });
  },

  insert: function(newItem, callback) {
    var news = new News(newItem);
    news.save(function(err){
      assert.equal(null, err, 'Could not save news in the database: ' + err);

      callback(news._id);
    });
  },

  findById: function(id, callback) {
    News.findById(ObjectId(id), function(err, news){
      assert.equal(null, err, 'Could not retrieve news with id ' + id + ' from the database: ' + err);

      callback(news);
    });
  },

  deleteById: function(id, callback) {
    News.remove({_id: ObjectId(id)}, function(err){
      assert.equal(null, err, 'Could not remove news with id ' + id + ' from the database: ' + err);

      callback(err);
    });
  },

  updateById: function(id, item, callback) {
    var updatedItem = item;
    if (!!item.metadata && typeof item.metadata === 'string') {
      updatedItem.metadata = JSON.parse(item.metadata);
    }
    delete updatedItem._id;

    News.findOneAndUpdate({_id: ObjectId(id)}, {$set: updatedItem}, function(err, result){
      assert.equal(null, err, 'Could not update news with id ' + id + ': ' + err);

      callback(id);
    });
  },

  deleteAll: function(callback) {
     News.remove({}, function(err) {
       assert.equal(null, err, 'Could not remove all news from database: ' + err);

       callback();
    });
  }
};

'use strict';

var MongoClient   = require('mongodb').MongoClient;
var ObjectId      = require('mongodb').ObjectId;
var assert        = require('assert');

var connect = function(callback){
  MongoClient.connect(process.env.DATABASE_URL, function(err, db){
    assert.equal(err, null);
    callback(db.collection('posts'));
  });
};

module.exports = function() {

  return {

    getAll: function(callback) {
      connect(function(collection){
        var cursor = collection.find();

        var result = [];
        cursor.each(function(err, doc) {
          if (doc !== null) {
            result.push(doc);
          } else {
            callback(result);
          }
        });
      });
    },

    insert: function(newItem, callback) {

      newItem.date = new Date();
      delete newItem._id;

      connect(function(collection){
        collection.insertOne(newItem, function(err, result) {
          callback(result.ops[0]._id);
        });
      });
    },

    findById: function(postId, callback) {
      connect(function(collection){
        collection.find({_id: ObjectId(postId)}).toArray( function(err, item) {
          callback(item[0]);
        });
      });
    },

    findByYearAndMonth: function(filterParams, callback) {
      connect(function(collection){
        var cursor = collection.find(filterParams);
        var result = [];
        cursor.each(function(err, doc) {
          if (doc !== null) {
            result.push(doc);
          } else {
            callback(result);
          }
        });
      });
    },

    deleteById: function(id, callback) {
      connect(function(collection){
        collection.remove({_id: ObjectId(id)}, function(err, result) {
          callback(result);
        });
      });
    }
  };
};

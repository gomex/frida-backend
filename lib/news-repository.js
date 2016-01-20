'use strict';

var MongoClient   = require('mongodb').MongoClient;
var ObjectId      = require('mongodb').ObjectId;
var assert        = require('assert');

var connect = function(callback){
  MongoClient.connect(process.env.DATABASE_URL, function(err, db){
    assert.equal(err, null);
    callback(db.collection('news'));
  });
};

module.exports =
{

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
    connect(function(collection){
      collection.insertOne(newItem, function(err, result) {
        callback(result.ops[0]._id);
      });
    });
  },

  findById: function(id, callback) {
    connect(function(collection){
      collection.find({_id: ObjectId(id)}).toArray( function(err, item) {
        callback(item[0]);
      });
    });
  },

  deleteById: function(id, callback) {
    connect(function(collection){
      collection.remove({_id: ObjectId(id)}, function(err, result) {
        callback(result);
      });
    });
  },

  updateById: function(id, item, callback) {
    var updatedItem = item;
    if (!!item.metadata && typeof item.metadata === 'string') {
      updatedItem.metadata = JSON.parse(item.metadata);
    }
    delete updatedItem._id;

    connect(function(collection){
      collection.updateOne({_id: ObjectId(id)}, { $set: updatedItem}, function(err, result) {
        assert.equal(err, null);
        callback(id);
      });
    });
  }
};
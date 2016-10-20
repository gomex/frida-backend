var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('underscore');

var schema = new Schema(
  {
    name: String,
    featured_01: { type: Schema.Types.ObjectId, ref: 'News'},
    featured_02: { type: Schema.Types.ObjectId, ref: 'News'},
    featured_03: { type: Schema.Types.ObjectId, ref: 'News'},
    featured_04: { type: Schema.Types.ObjectId, ref: 'News'},
    featured_05: { type: Schema.Types.ObjectId, ref: 'News'},
    featured_06: { type: Schema.Types.ObjectId, ref: 'News'},
    featured_07: { type: Schema.Types.ObjectId, ref: 'News'},
    featured_08: { type: Schema.Types.ObjectId, ref: 'News'}
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

var Home = mongoose.model('Home', schema);

Home.findByName = (name, callback) => {
  Home.find({name: name}, null, {limit: 1}, (err, results) => {
    callback(err, _.first(results));
  });
};

module.exports = Home;

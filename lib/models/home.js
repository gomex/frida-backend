var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function handleEmptyValue(v) {
  return v == '' ? null : v;
}

var schema = new Schema(
  {
    name: String,
    layout: String,
    featured_01: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
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
  Home.findOne({name: name}, null, (err, result) => {
    var notFound = result ? false : 'Not Found';
    callback(err || notFound, result);
  });
};

Home.init = (callback) => {
  Home.findByName('bdf', (err, bdf) => {
    if (bdf) {
      return callback();
    }

    Home.create({name:'bdf'}, callback);
  });
};

module.exports = Home;

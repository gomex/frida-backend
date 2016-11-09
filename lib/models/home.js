var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');

function handleEmptyValue(v) {
  return v == '' ? null : v;
}

var schema = new Schema(
  {
    name: String,
    layout: String,
    path: { type: String, default: '' },
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

schema.methods.isRadioAgencia = function() {
  return this.name == 'radio_agencia';
};

var Home = mongoose.model('Home', schema);

Home.findByName = (name, callback) => {
  Home.findOne({name: name}, null, callback);
};

Home.init = (callback) => {
  var create = (home, callback) => {
    Home.findByName(home.name, (err, result) => {
      if (result) {
        return callback();
      }

      Home.create(home, callback);
    });
  };

  async.parallel([
    async.apply(create, { name: 'bdf', layout: 'national', path: '/' }),
    async.apply(create, { name: 'radio_agencia', layout: 'radioagencia', path: '/radioagencia' })
  ], callback);
};

module.exports = Home;

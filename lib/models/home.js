var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');

function handleEmptyValue(v) {
  return v == '' ? null : v;
}

var schema = new Schema(
  {
    name: String,
    path: { type: String, default: '' },

    featured_01: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    featured_02: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    featured_03: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    featured_04: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    featured_05: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    featured_06: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    featured_07: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    featured_08: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },

    column_01: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    column_02: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    column_03: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },

    photo_caption: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },

    tabloid_ce: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    tabloid_mg: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    tabloid_pr: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    tabloid_pe: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    tabloid_rj: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },

    spotlight_01: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    spotlight_02: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    spotlight_03: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },

    advertising_01: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    advertising_02: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    advertising_03: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    advertising_04: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    advertising_05: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    advertising_06: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    advertising_07: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },

    service_01: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    service_02: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    service_03: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    service_04: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue },
    service_05: { type: Schema.Types.ObjectId, ref: 'News', set: handleEmptyValue }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

schema.pre('save', function(callback) {
  this.increment();
  callback();
});

schema.methods.populateAllFields = function(callback) {
  var paths = [];

  schema.eachPath((pathname, schemaType) => {
    if (pathname == '_id') return;

    if (schemaType.options.ref && this[pathname]) {
      paths.push(pathname);
    }
  });

  if (paths.length) {
    this.populate(paths.join(' '), callback);
  } else {
    callback();
  }
};

schema.methods.isRadioAgencia = function() {
  return this.name == 'radio_agencia';
};

schema.methods.isBDF = function() {
  return this.name == 'bdf';
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
    async.apply(create, { name: 'bdf', path: '/' }),
    async.apply(create, { name: 'radio_agencia', path: '/radioagencia' })
  ], callback);
};

module.exports = Home;

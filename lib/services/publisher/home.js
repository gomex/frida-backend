var series = require('async').series;
var apply = require('async').apply;
var parallel = require('async').parallel;
var hexo = require('lib/services/hexo');
var bdf = require('lib/models/home/bdf');
var Home = require('lib/models/home');
var radioAgencia = require('lib/models/home/radio-agencia');

function enrichesBDF(home, callback) {
  parallel({
    last_news: bdf.getLastNews,
    most_read: bdf.getMostRead
  }, (err, results) => {
    Object.assign(home, results);
    callback(err, home);
  });
}

function enrichesRadioAgencia(home, callback) {
  parallel({
    latest_news: apply(radioAgencia.getRadioNewsList, [home.featured_01 && home.featured_01._id]),
  }, (err, results) => {
    Object.assign(home, results);
    callback(err, home);
  });
}

function enrichesHome(home, callback) {
  if (home.isBDF()) {
    enrichesBDF(home, callback);
  } else if (home.isRadioAgencia()) {
    enrichesRadioAgencia(home, callback);
  } else {
    callback();
  }
}

function publish(home, callback) {
  series([
    (cb) => home.populateAllFields(cb),
    apply(enrichesHome, home),
    apply(hexo.publishHome, home)
  ], callback);
}

var publishAll = function(callback) {
  var findAndPublish = (name, callback) => {
    Home.findByName(name, (err, home) => {
      if (err) return callback(err);
      if (!home) return callback(`Not Found ${name}`);

      publish(home, callback);
    });
  };

  series([
    apply(findAndPublish, 'bdf'),
    apply(findAndPublish, 'radio_agencia')
  ], callback);
};

module.exports = {
  publish,
  publishAll
};

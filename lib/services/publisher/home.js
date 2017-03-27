var series = require('async').series;
var apply = require('async').apply;
var parallel = require('async').parallel;
var hexo = require('lib/services/hexo');
var bdf = require('lib/models/home/bdf');
var News = require('lib/models/news');
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
    service_01: apply(getService, 'hojenahistoria'),
    service_02: apply(getService, 'alimentoesaude'),
    service_03: apply(getService, 'nossosdireitos'),
    service_04: apply(getService, 'fatoscuriosos'),
    service_05: apply(getService, 'mosaicocultural')
  }, (err, results) => {
    if (process.env.TOGGLE_6kDAA5TZ_AUTOMATIC_SERVICES == 'enabled') {
      Object.assign(home, results);
    } else {
      home.latest_news = results.latest_news;
    }
    callback(err, home);
  });
}

function getService(name, callback) {
  News.findOne()
    .publisheds()
    .byService(name)
    .sort('-published_at')
    .exec(callback);
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

require('app-module-path').addPath(__dirname + '/');

var _ = require('underscore');
var later = require('later');
require('dotenv').config();

var db = require('lib/db/initializer');
var Home = require('lib/models/home');
var columnist = require('lib/services/columnist');
var server = require('lib/http/server');
var recover = require('lib/services/publisher/recover');
var scheduler = require('lib/services/scheduler');

function initHome() {
  Home.init((err) => {
    if (err) console.error('Error Home.init', err);
  });
}

function initScheduler() {
  var recurrence = later.parse.recur().every(1).minute();
  later.setInterval(() => scheduler.publish(_.noop), recurrence);
}

db.connect(() => {
  initHome();
  recover.publish(_.noop);
  initScheduler();
  server.start();
});

columnist.write((err) => {
  if (err) console.error('Error columnist.write', err);
});

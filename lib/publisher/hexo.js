'use strict';

var grayMatter = require('gray-matter');
var YAML = require('js-yaml');
var moment = require('moment');
var path = require('path');
var _ = require('underscore');
var async = require('async');
var spawn = require('child_process').spawn;

var presenter = require('./presenter');
var listPresenter = require('./presenters/list');
var radioAgenciaPresenter = require('./presenters/radio-agencia');
var bdfPresenter = require('./presenters/bdf');
var hexoSource = require('./hexo_source');

var HEXO_DATA_PATH = '_data';
var HEXO_NEWS_PATH = '_posts';

var cargoOfPostsToPublish = async.cargo((tasks, callback) => {
  console.log('Site generation started.');
  var deployer;
  if(process.env.TOGGLE_qVIq5Tnp_INCREMENTAL_GEN == 'enabled') {
    deployer = spawn(path.join(process.env.HEXO_SITE_PATH, 'hexo-generate.sh'),
        [process.env.HEXO_SITE_PATH, process.env.HEXO_SITE_DEST]);
  } else {
    deployer = spawn(path.join(process.env.HEXO_SITE_PATH, 'hexo-deployer.sh'),
        [process.env.HEXO_SITE_PATH, process.env.HEXO_SITE_DEST, 'clean']);
  }

  deployer.stdout.setEncoding('utf8');
  deployer.stdout.on('data', (data) => {
    console.log('hexo deployer:', data);
  });

  deployer.stderr.setEncoding('utf8');
  deployer.stderr.on('data', (data) => {
    console.log('hexo deployer:', data);
  });

  deployer.on('error', (err) => {
    console.log('Site generation error.', err);
  });

  deployer.on('close', (code) => {
    console.log('Site generation finished.');
    callback(code);
  });
}, 100);

function getNewsSourcePath(news) {
  var dir = moment(news.published_at).format('YYYY/MM');
  var name = news._id + '.md';
  return path.join(HEXO_NEWS_PATH, dir, name);
}

function write(filepath, text, data, callback) {
  try {
    var frontMatter = grayMatter.stringify(text, data);
    hexoSource.write(filepath, frontMatter, callback);
  } catch(error) {
    callback({error, filepath, text, data});
  }
}

function generate(task, callback) {
  cargoOfPostsToPublish.push(task, callback);
}

function publish(news, callback) {
  var data = presenter.of(news).getData(news);
  var filepath = getNewsSourcePath(news);

  write(filepath, news.body, data, callback);
}

function unpublish(news, callback) {
  hexoSource.remove(getNewsSourcePath(news), callback);
}

function publishList(list, callback) {
  if (list.news.length == 0) return callback();

  var data = listPresenter.getData(list);
  _.rest(data).map(function(d) {
    var filepath = path.join(list.path, 'pagina'+(d.current+1)+'.md');
    write(filepath, '', data[d.current], _.noop);
  });

  var filepath = path.join(list.path, 'index.md');
  write(filepath, '', data[0], callback);
}

function getHomeData(home) {
  if (home.isBDF()) {
    return bdfPresenter.getData(home);
  } else if (home.isRadioAgencia()){
    return radioAgenciaPresenter.getData(home);
  } else {
    return null;
  }
}

function publishHome(home, callback) {
  var data = getHomeData(home);
  var sourcePath = path.join(home.path, 'index.md');

  write(sourcePath, '', data, callback);
}

function publishAdvertisingData(home, callback) {
  var data = bdfPresenter.getAdvertisingData(home);
  hexoSource.write(path.join(HEXO_DATA_PATH, 'advertisings.yml'), YAML.dump(data), callback);
}

module.exports = {
  unpublish,
  publish,
  publishList,
  publishHome,
  publishAdvertisingData,
  generate
};

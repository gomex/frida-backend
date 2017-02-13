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
var writer = require('./writer');

var HEXO_DATA_PATH = '_data';
var HEXO_NEWS_PATH = '_posts';

var cargoOfPostsToPublish = async.cargo((tasks, callback) => {
  console.log('Site generation started.');
  const deployer = spawn(path.join(process.env.HEXO_SITE_PATH, 'hexo-deployer.sh'),
      [process.env.HEXO_SITE_PATH, process.env.HEXO_SITE_DEST, 'clean']);

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

function getListUrl(area) {
  if (area === 'column') {
    return 'colunistas';
  } else if (area.includes('tabloid_')) {
    return {
      'tabloid_rj': 'rio-de-janeiro',
      'tabloid_mg': 'minas-gerais',
      'tabloid_pr': 'parana',
      'tabloid_ce': 'ceara',
      'tabloid_pe': 'pernambuco'
    }[area];
  } else {
    return area;
  }
}

function createAreaPaginationDataFiles(areaName, areaPageData, callback) {
  if (areaPageData.length == 0) return callback();

  var areaPath = getListUrl(areaName);

  // other pages
  _.rest(areaPageData).map(function(d) {
    var filepath = path.join(areaPath, 'pagina'+(d.current+1)+'.md');

    write(filepath, '', areaPageData[d.current], _.noop);
  });
  // area index page
  var filepath = path.join(areaPath, 'index.md');

  write(filepath, '', areaPageData[0], callback);
}

function getNewsSourcePath(news) {
  var dir = moment(news.published_at).format('YYYY/MM');
  var name = news._id + '.md';
  return path.join(HEXO_NEWS_PATH, dir, name);
}

function write(filepath, text, data, callback) {
  try {
    var frontMatter = grayMatter.stringify(text, data);
    writer.write(filepath, frontMatter, callback);
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
  writer.remove(getNewsSourcePath(news), callback);
}

function publishList(list, callback) {
  var data = listPresenter.getData(list);
  createAreaPaginationDataFiles(list.area, data, callback);
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
  writer.write(path.join(HEXO_DATA_PATH, 'advertisings.yml'), YAML.dump(data), callback);
}

module.exports = {
  unpublish,
  publish,
  publishList,
  publishHome,
  publishAdvertisingData,
  generate
};

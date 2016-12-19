'use strict';

var grayMatter = require('gray-matter');
var YAML = require('js-yaml');
var moment = require('moment');
var path = require('path');
var _ = require('underscore');

var areaPageStrategy = require('./area-page-strategy');
var presenter = require('./presenter');
var radioAgenciaPresenter = require('./presenters/radio-agencia');
var bdfPresenter = require('./presenters/bdf');
var advertisingsPresenter = require('./advertisings');
var photoCaptionList = require('./photo-caption-list');
var writer = require('./writer');

var HEXO_DATA_PATH = '_data';
var HEXO_NEWS_PATH = '_posts';

function createAreaPaginationDataFiles(areaName, areaPageData, callback) {
  areaName = (areaName === 'column') ? 'colunistas' : areaName;

  // other pages
  _.rest(areaPageData).map(function(d) {
    var filepath = path.join(areaName, 'pagina'+(d.current+1)+'.md');

    write(filepath, '', areaPageData[d.current], _.noop);
  });
  // area index page
  var filepath = path.join(areaName, 'index.md');

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

function publish(news, callback) {
  var data = presenter.of(news).getData(news);
  var filepath = getNewsSourcePath(news);

  write(filepath, news.body, data, callback);
}

function unpublish(news, callback) {
  writer.remove(getNewsSourcePath(news), callback);
}

function publishList(list, callback) {
  var data = photoCaptionList.getData(list);

  createAreaPaginationDataFiles(data.area, [data], callback);
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

function updateAreaPage(areaName, callback) {
  areaPageStrategy.buildPageData(areaName, function(err, areaPageData) {
    if(err) {
      callback(err);
    } else {
      createAreaPaginationDataFiles(areaName, areaPageData, callback);
    }
  });
}

function updateAdvertisingData(list, callback) {
  var dataYaml = YAML.dump(advertisingsPresenter.getData(list));
  writer.write(path.join(HEXO_DATA_PATH, 'advertisings.yml'), dataYaml, callback);
}

module.exports = {
  unpublish,
  publish,
  publishList,
  publishHome,
  updateAreaPage,
  updateAdvertisingData
};

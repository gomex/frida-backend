var postPresenter = require('lib/services/publisher/presenter/post');
var tabloidPresenter = require('lib/services/publisher/presenter/tabloid');
var columnPresenter = require('lib/services/publisher/presenter/column');
var tabloidNewsPublisher = require('lib/services/publisher/presenter/tabloid-news');
var advertisingPresenter = require('lib/services/publisher/presenter/advertising');
var spotlightPresenter = require('lib/services/publisher/presenter/spotlight');
var photoCaptionPresenter = require('lib/services/publisher/presenter/photo-caption');
var specialPresenter = require('lib/services/publisher/presenter/special');

function of(model) {
  if (model.isPost()) {
    return postPresenter;
  } else if(model.isTabloid()) {
    return tabloidPresenter;
  } else if (model.isColumn()) {
    return columnPresenter;
  } else if(model.isTabloidNews()) {
    return tabloidNewsPublisher;
  } else if(model.isAdvertising()) {
    return advertisingPresenter;
  } else if(model.isPhotoCaption()) {
    return photoCaptionPresenter;
  } else if(model.isSpotlight()) {
    return spotlightPresenter;
  } else if(model.isSpecial()) {
    return specialPresenter;
  } else {
    throw new Error('There is no presenter to model', model);
  }
}

function getListData(news, options) {
  return module.exports.of(news).getListData(news, options);
}

module.exports = {
  of: of,
  getListData: getListData
};

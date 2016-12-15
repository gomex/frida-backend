var postPresenter = require('./presenters/post');
var tabloidPresenter = require('./presenters/tabloid');
var columnPresenter = require('./presenters/column');
var tabloidNewsPublisher = require('./presenters/tabloid-news');
var advertisingPresenter = require('./presenters/advertising');
var spotlightPresenter = require('./presenters/spotlight');
var photoCaptionPresenter = require('./presenters/photo-caption');
var specialPresenter = require('./presenters/special');

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

function getListData(news) {
  return module.exports.of(news).getListData(news);
}

module.exports = {
  of: of,
  getListData: getListData
};

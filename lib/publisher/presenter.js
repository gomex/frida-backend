var postPresenter = require('./presenters/post');
var tabloidPresenter = require('./presenters/tabloid');
var columnPresenter = require('./presenters/column');
var tabloidNewsPublisher = require('./presenters/tabloid-news');
var advertisingPresenter = require('./presenters/advertising');
var spotlightPresenter = require('./presenters/spotlight');
var photoCaptionPresenter = require('./presenters/photo-caption');

function of(news) {
  if (news.isPost()) {
    return postPresenter;
  } else if(news.isTabloid()) {
    return tabloidPresenter;
  } else if (news.isColumn()) {
    return columnPresenter;
  } else if(news.isTabloidNews()) {
    return tabloidNewsPublisher;
  } else if(news.isAdvertising()) {
    return advertisingPresenter;
  } else if(news.isPhotoCaption()) {
    return photoCaptionPresenter;
  } else if(news.isSpotlight()) {
    return spotlightPresenter;
  } else {
    throw new Error('There is no presenter to news', news);
  }
}

module.exports = {
  of: of
};

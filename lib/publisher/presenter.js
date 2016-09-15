var postPresenter = require('./presenters/post');
var tabloidPresenter = require('./presenters/tabloid');
var columnPresenter = require('./presenters/column');
var tabloidNewsPublisher = require('./presenters/tabloid-news');
var advertisingPublisher = require('./presenters/advertising');
var newsPublisher = require('./news');

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
    return advertisingPublisher;
  } else {
    return newsPublisher;
  }
}

module.exports = {
  of: of
};

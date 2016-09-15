var postPresenter = require('./presenters/post');
var tabloidPresenter = require('./presenters/tabloid');
var columnPresenter = require('./presenters/column');

function of(news) {
  if (news.isPost()) {
    return postPresenter;
  } else if(news.isTabloid()) {
    return tabloidPresenter;
  } else if (news.isColumn()) {
    return columnPresenter;
  }
}

module.exports = {
  of: of
};

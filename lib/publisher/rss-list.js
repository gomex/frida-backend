var _ = require('underscore');
var postPresenter = require('./presenters/post');

function getData(news) {
  return {
    layout: 'rss',
    pubDate: Date.now(),
    list: _.map(news, (news) => postPresenter.getRSSData(news))
  };
}

module.exports = {
  getData: getData
};

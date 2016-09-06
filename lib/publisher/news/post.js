var _ = require('underscore');
var publisherNews = require('../news');

function getData(post) {
  var dataPost = publisherNews.getData(post);

  dataPost.other_news = _.map(post.other_news, (post) => {
    return getDataToList(post);
  });
  dataPost.related_news = _.map(post.related_news, (post) => {
    return getDataToList(post);
  });

  return dataPost;
}

function getDataToList(post) {
  return _.omit(publisherNews.getData(post), 'related_news');
}

module.exports = {
  getData: getData,
  getDataToList: getDataToList
};

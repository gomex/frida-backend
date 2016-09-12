var _ = require('underscore');
var publisherNews = require('../news');

function getData(post) {
  var dataPost = publisherNews.getData(post);

  dataPost.other_news = getDataList(post.other_news);
  dataPost.related_news = getDataList(post.related_news);

  return dataPost;
}

function getDataList(list) {
  return _.chain(list)
    .flatten()
    .map((post) => {
      return publisherNews.getData(post);
    })
    .value();
}

module.exports = {
  getData: getData
};

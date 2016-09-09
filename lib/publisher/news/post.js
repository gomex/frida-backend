var _ = require('underscore');
var publisherNews = require('../news');

function getData(post) {
  var dataPost = publisherNews.getData(post);

  dataPost.other_news = _.map(post.other_news, (post) => {
    return publisherNews.getData(post);
  });
  dataPost.related_news = _.map(post.related_news, (post) => {
    return publisherNews.getData(post);
  });

  return dataPost;
}

module.exports = {
  getData: getData
};

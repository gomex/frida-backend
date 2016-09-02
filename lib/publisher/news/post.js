var _ = require('underscore');
var publisherNews = require('../news');

function getData(post) {
  var dataPost = publisherNews.getData(post);

  dataPost.other_news = _.map(post.other_news, (news) => {
    return publisherNews.getData(news);
  });

  dataPost.related_news = _.map(post.related_news, (news) => {
    return publisherNews.getData(news);
  });

  return dataPost;
}

module.exports = {
  getData: getData
};

var _ = require('underscore');
var coverPresenter = require('./cover');

function getData(post) {
  return Object.assign(
    {
      layout: post.metadata.layout,
      area: post.metadata.area,
      url: post.metadata.url,
      path: post.metadata.url,
      hat: post.metadata.hat,
      title: post.metadata.title,
      description: post.metadata.description,
      author: post.metadata.author,
      place: post.metadata.place,
      tags: post.tags,
      audio: post.audio || null,
      date: post.published_at,
      published_at: post.published_at
    },
    coverPresenter.getData(post),
    getOtherNews(post),
    getRelatedNews(post)
  );
}

function getListData(post) {
  return Object.assign(
    {
      title: post.metadata.title,
      area: post.metadata.area,
      hat: post.metadata.hat,
      description: post.metadata.description,
      url: post.metadata.url,
      path: post.metadata.url,
      audio: post.audio || '',
      date: post.published_at,
      published_at: post.published_at
    },
    coverPresenter.getData(post)
  );
}

function getList(list) {
  return _.chain(list)
    .compact()
    .map((other_news) => module.exports.getListData(other_news))
    .value();
}

function getOtherNews(post) {
  return {
    other_news: getList(post.other_news)
  };
}

function getRelatedNews(post) {
  return {
    related_news: getList(post.related_news)
  };
}

module.exports = {
  getData: getData,
  getListData: getListData
};

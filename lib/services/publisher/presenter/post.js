var _ = require('underscore');
var coverPresenter = require('lib/services/publisher/presenter/cover');
var optionsPresenter = require('lib/services/publisher/presenter/options');
var markdown = require('markdown').markdown;
var presenter;

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
      editor: post.metadata.editor || null,
      place: markdown.toHTML(post.metadata.place),
      labels: post.tags,
      audio: post.audio || null,
      date: post.published_at,
      published_at: post.published_at
    },
    coverPresenter.getData(post),
    getOtherNews(post),
    getRelatedNews(post)
  );
}

function getListData(post, options) {
  return Object.assign(
    {
      title: post.metadata.title,
      area: post.metadata.area,
      hat: post.metadata.hat,
      description: post.metadata.description,
      author: post.metadata.author,
      url: post.metadata.url,
      path: post.metadata.url,
      audio: post.audio || null,
      date: post.published_at,
      published_at: post.published_at
    },
    coverPresenter.getData(post),
    optionsPresenter.getData(post, options)
  );
}

function getList(list) {
  // only requiring presenter here because it's a cyclic dependency
  presenter = (presenter) ? presenter : require('lib/services/publisher/presenter');
  return _.chain(list)
    .compact()
    .map((other_news) => presenter.getListData(other_news))
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

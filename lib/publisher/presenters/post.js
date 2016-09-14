var _ = require('underscore');

function getData(post) {
  return Object.assign(
    {
      layout: post.metadata.layout,
      display_area: post.metadata.display_area,
      area: post.metadata.area,
      url: post.metadata.url,
      hat: post.metadata.hat,
      title: post.metadata.title,
      description: post.metadata.description,
      author: post.metadata.author,
      place: post.metadata.place,
      tags: post.tags,
      date: post.published_at,
      published_at: post.published_at
    },
    getCover(post),
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
      date: post.published_at,
      published_at: post.published_at
    },
    getCover(post)
  );
}

function getList(list) {
  return _.chain(list)
    .flatten()
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

function getCover(post) {
  if (post.metadata.cover) {
    return {
      cover: {
        link: post.metadata.cover.link,
        thumbnail: post.metadata.cover.thumbnail,
        medium: post.metadata.cover.medium,
        small: post.metadata.cover.small,
        title: post.metadata.cover.title,
        credits: post.metadata.cover.credits,
        subtitle: post.metadata.cover.subtitle
      }
    };
  } else {
    return {};
  }
}

module.exports = {
  getData: getData,
  getListData: getListData
};
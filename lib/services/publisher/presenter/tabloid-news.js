var coverPresenter = require('lib/services/publisher/presenter/cover');
var optionsPresenter = require('lib/services/publisher/presenter/options');
var markdown = require('markdown').markdown;

function getData(tabloidNews) {
  return Object.assign(
    {
      layout: tabloidNews.metadata.layout,
      area: tabloidNews.metadata.area,
      url: tabloidNews.metadata.url,
      path: tabloidNews.metadata.url,
      audio: tabloidNews.audio || null,
      hat: tabloidNews.metadata.hat,
      title: tabloidNews.metadata.title,
      description: tabloidNews.metadata.description,
      region: tabloidNews.region,
      issuu: tabloidNews.issuu || null,
      edition: tabloidNews.edition || null,
      author: tabloidNews.metadata.author,
      editor: tabloidNews.metadata.editor || null,
      place: markdown.toHTML(tabloidNews.metadata.place),
      labels: tabloidNews.tags,
      date: tabloidNews.published_at,
      published_at: tabloidNews.published_at
    },
    coverPresenter.getData(tabloidNews)
  );
}

function getListData(tabloidNews, options) {
  return Object.assign(
    {
      title: tabloidNews.metadata.title,
      area: tabloidNews.metadata.area,
      hat: tabloidNews.metadata.hat,
      description: tabloidNews.metadata.description,
      author: tabloidNews.metadata.author,
      url: tabloidNews.metadata.url,
      path: tabloidNews.metadata.url,
      audio: tabloidNews.audio || null,
      date: tabloidNews.published_at,
      published_at: tabloidNews.published_at
    },
    coverPresenter.getData(tabloidNews),
    optionsPresenter.getData(tabloidNews, options)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

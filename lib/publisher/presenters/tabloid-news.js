var coverPresenter = require('./cover');

function getData(tabloidNews) {
  return Object.assign(
    {
      layout: tabloidNews.metadata.layout,
      area: tabloidNews.metadata.area,
      url: tabloidNews.metadata.url,
      path: tabloidNews.metadata.url,
      hat: tabloidNews.metadata.hat,
      title: tabloidNews.metadata.title,
      description: tabloidNews.metadata.description,
      regional_area: tabloidNews.regional_area,
      author: tabloidNews.metadata.author,
      place: tabloidNews.metadata.place,
      tags: tabloidNews.tags,
      date: tabloidNews.published_at,
      published_at: tabloidNews.published_at
    },
    coverPresenter.getData(tabloidNews)
  );
}

function getListData(tabloidNews) {
  return Object.assign(
    {
      title: tabloidNews.metadata.title,
      area: tabloidNews.metadata.area,
      hat: tabloidNews.metadata.hat,
      description: tabloidNews.metadata.description,
      url: tabloidNews.metadata.url,
      path: tabloidNews.metadata.url,
      date: tabloidNews.published_at,
      published_at: tabloidNews.published_at
    },
    coverPresenter.getData(tabloidNews)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

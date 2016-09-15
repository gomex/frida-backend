var coverPresenter = require('./cover');

function getData(column) {
  return Object.assign(
    {
      layout: column.metadata.layout,
      display_area: column.metadata.display_area,
      url: column.metadata.url,
      hat: column.metadata.hat,
      title: column.metadata.title,
      description: column.metadata.description,
      place: column.metadata.place,
      columnist: column.metadata.columnist,
      date: column.published_at,
      published_at: column.published_at
    },
    coverPresenter.getData(column)
  );
}

function getListData(column) {
  return Object.assign(
    {
      title: column.metadata.title,
      hat: column.metadata.hat,
      description: column.metadata.description,
      url: column.metadata.url,
      columnist: column.metadata.columnist,
      date: column.published_at,
      published_at: column.published_at
    },
    coverPresenter.getData(column)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

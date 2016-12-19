var coverPresenter = require('./cover');

function getData(column) {
  return Object.assign(
    {
      layout: column.metadata.layout,
      url: column.metadata.url,
      path: column.metadata.url,
      hat: 'coluna',
      title: column.metadata.title,
      description: column.metadata.description,
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
      hat: 'coluna',
      description: column.metadata.description,
      url: column.metadata.url,
      path: column.metadata.url,
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

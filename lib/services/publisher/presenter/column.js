var coverPresenter = require('lib/services/publisher/presenter/cover');
var optionsPresenter = require('lib/services/publisher/presenter/options');
var columnist = require('lib/services/columnist');

function getData(column) {
  return Object.assign(
    {
      layout: column.metadata.layout,
      url: column.metadata.url,
      path: column.metadata.url,
      audio: column.audio || '',
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

function getListData(column, options) {
  return Object.assign(
    {
      title: column.metadata.title,
      hat: 'coluna',
      description: column.metadata.description,
      url: column.metadata.url,
      path: column.metadata.url,
      audio: column.audio || '',
      columnist: column.metadata.columnist,
      author: columnist.columnistsByEmail()[column.metadata.columnist].name,
      date: column.published_at,
      published_at: column.published_at
    },
    coverPresenter.getData(column),
    optionsPresenter.getData(column, options)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

var coverPresenter = require('./cover');

function getData(special) {
  return Object.assign(
    {
      layout: special.metadata.layout,
      path: special.metadata.url,
      url: special.metadata.url,
      title: special.metadata.title,
      description: special.metadata.description,
      published_at: special.published_at,
      labels: special.tags,
      sections: special.sections
    },
    coverPresenter.getData(special)
  );
}

function getListData(special) {
  return Object.assign(
    {
      path: special.metadata.url,
      title: special.metadata.title,
      published_at: special.published_at
    },
    coverPresenter.getData(special)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

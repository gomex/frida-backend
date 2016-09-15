var coverPresenter = require('./cover');

function getData(photoCaption) {
  return Object.assign(
    {
      layout: photoCaption.metadata.layout,
      title: photoCaption.metadata.title
    },
    coverPresenter.getData(photoCaption)
  );
}

function getListData(photoCaption) {
  return Object.assign(
    {
      title: photoCaption.metadata.title
    },
    coverPresenter.getData(photoCaption)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

var coverPresenter = require('./cover');

function getData(photoCaption) {
  return Object.assign(
    {
      layout: photoCaption.metadata.layout,
      url: photoCaption.metadata.url,
      title: photoCaption.metadata.title
    },
    coverPresenter.getData(photoCaption)
  );
}

function getListData(photoCaption) {
  return Object.assign(
    {
      title: photoCaption.metadata.title,
      url: photoCaption.metadata.url
    },
    coverPresenter.getData(photoCaption)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

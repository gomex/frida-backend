var coverPresenter = require('./cover');

function getData(photoCaption) {
  return Object.assign(
    {
      layout: photoCaption.metadata.layout,
      url: photoCaption.metadata.url,
      title: photoCaption.metadata.title
    },
    relatedPhotoCaptions(photoCaption),
    coverPresenter.getData(photoCaption)
  );
}

function relatedPhotoCaptions(photoCaption) {
  return {
    related_photo_captions: _.map(
      photoCaption.related_photo_captions,
      (photoCaption) => module.exports.getListData(photoCaption)
    )
  };
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

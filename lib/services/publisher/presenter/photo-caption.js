var _ = require('underscore');
var coverPresenter = require('lib/services/publisher/presenter/cover');
var optionsPresenter = require('lib/services/publisher/presenter/options');

function getData(photoCaption) {
  return Object.assign(
    {
      layout: photoCaption.metadata.layout,
      url: photoCaption.metadata.url,
      path: photoCaption.metadata.url,
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

function getListData(photoCaption, options) {
  return Object.assign(
    {
      title: photoCaption.metadata.title,
      url: photoCaption.metadata.url,
      path: photoCaption.metadata.url
    },
    coverPresenter.getData(photoCaption),
    optionsPresenter.getData(photoCaption, options)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

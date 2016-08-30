var _ = require('underscore');
var publisherNews = require('./news');

function getData(photoCaption) {
  return _.map(photoCaption, (photoCaption) => publisherNews.getData(photoCaption));
}

module.exports = {
  getData: getData
};

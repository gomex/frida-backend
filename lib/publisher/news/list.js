var _ = require('underscore');
var photoCaptionPresenter = require('../presenters/photo-caption');

function getData(news) {
  return {
    area: 'charges',
    layout: 'photo_caption_list',
    list: _.map(news, (news) => photoCaptionPresenter.getData(news))
  };
}

module.exports = {
  getData: getData
};

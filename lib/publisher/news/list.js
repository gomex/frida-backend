var _ = require('underscore');
var newsPublisher = require('../news.js');

function getData(news) {
  return {
    area: 'charges',
    layout: 'photo_caption_list',
    list: _.map(news, (news) => newsPublisher.getData(news))
  };
}

module.exports = {
  getData: getData
};

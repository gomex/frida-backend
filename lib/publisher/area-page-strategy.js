'use strict';

var newsRepository  = require('../news/news-repository');

function lastNewsFor(area) {
  return {
    'status': 'published',
    'metadata.layout': 'post',
    'metadata.area': area
  };
}

var newsProjection = {
  '_id': false,
  'cover.url': '$metadata.cover.link',
  'cover.small': '$metadata.cover.small',
  'cover.credits': '$metadata.cover.credits',
  'cover.subtitle': '$metadata.cover.subtitle',
  'date': '$published_at',
  'description':'$metadata.description',
  'title':'$metadata.title',
  'path': '$metadata.url',
  'hat': '$metadata.hat'
};

var sortByPublishedDate = { 'published_at': -1 };

function buildPageData(area, callback) {
  var newsForAreaHome = {};

  newsRepository.find(lastNewsFor(area), newsProjection, 20, sortByPublishedDate, function(err, result){
    if(!err) {
      newsForAreaHome.layout = 'news_list';
      newsForAreaHome.news = result;
      newsForAreaHome.area = area;
    }

    callback(err, newsForAreaHome);
  });
}

module.exports = {
  buildPageData: buildPageData
};

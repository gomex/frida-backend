'use strict';

var Utils = {};

Utils.publishedNewsFor = function(area) {
  if (area == 'ultimas_noticias') {
    return {
      'status': 'published',
      $or: [
        {'metadata.layout': 'post'},
        {'metadata.layout': 'tabloid_news'},
        {'metadata.layout': 'column'},
        {'metadata.layout': 'special'},
      ]
    };
  }
  else if ((area == 'pernambuco') || (area == 'parana') || (area == 'rio_de_janeiro') || (area == 'minas_gerais' )) {
    return {
      'status': 'published',
      'metadata.layout': 'tabloid_news',
    };
  }
  else {
    return {
      'status': 'published',
      $or: [
        {'metadata.layout': 'post'},
        {'metadata.layout': 'tabloid_news'},
        {'metadata.layout': 'special'}
      ],
      'metadata.area': area
    };
  }
};

Utils.publishedColumns = {
  'status': 'published',
  'metadata.layout': 'column'
};

Utils.newsProjection = {
  '_id': false,
  'cover.url': '$metadata.cover.link',
  'cover.small': '$metadata.cover.small',
  'cover.medium': '$metadata.cover.medium',
  'cover.credits': '$metadata.cover.credits',
  'cover.subtitle': '$metadata.cover.subtitle',
  'date': '$published_at',
  'description':'$metadata.description',
  'title':'$metadata.title',
  'path': '$metadata.url',
  'author': '$metadata.author',
  'updated_at': '$updated_at'
};

Utils.columnProjection = {
  '_id': false,
  'columnist': '$metadata.columnist',
  'title': '$metadata.title',
  'description': '$metadata.description',
  'date': '$published_at',
  'path': '$metadata.url'
};

Utils.sortByPublishedDate = { 'published_at': -1 };

Utils.toDisplayName = function(areaName) {
  if(Utils.identifierToDisplayName[areaName]) {
    return Utils.identifierToDisplayName[areaName];
  } else {
    return  areaName;
  }
};

Utils.identifierToDisplayName = {
  'direitos_humanos': 'direitos humanos',
  'espanol': 'español',
  'ultimas_noticias': 'últimas notícias',
  'politica': 'política',
  'radio': 'rádio',
  'opiniao': 'opinião'
};

module.exports = Utils;

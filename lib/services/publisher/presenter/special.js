var coverPresenter = require('lib/services/publisher/presenter/cover');
var textPresenter = require('lib/services/publisher/presenter/special/text');
var imagePresenter = require('lib/services/publisher/presenter/special/image');
var linksPresenter = require('lib/services/publisher/presenter/special/links');
var _ = require('underscore');

function getData(special) {
  return Object.assign(
    {
      layout: special.metadata.layout,
      path: special.metadata.url,
      hat: 'especial',
      url: special.metadata.url,
      title: special.metadata.title,
      description: special.metadata.description,
      published_at: special.published_at,
      labels: special.tags,
      sections: getSections(special)
    },
    coverPresenter.getData(special)
  );
}

function getSections(special) {
  return _.map(special.sections, (section) => {
    if(section.type == 'text') {
      return textPresenter.getData(section);
    } if(section.type == 'image') {
      return imagePresenter.getData(section);
    } if(section.type == 'links') {
      return linksPresenter.getData(section);
    } else {
      return section;
    }
  });
}

function getListData(special) {
  return Object.assign(
    {
      path: special.metadata.url,
      hat: 'especial',
      author: 'Redação Brasil de Fato',
      title: special.metadata.title,
      published_at: special.published_at,
      layout: special.metadata.layout
    },
    coverPresenter.getData(special)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

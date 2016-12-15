var coverPresenter = require('./cover');
var textPresenter = require('./special/text');
var _ = require('underscore');

function getData(special) {
  return Object.assign(
    {
      layout: special.metadata.layout,
      path: special.metadata.url,
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
    } else {
      return section;
    }
  });
}

function getListData(special) {
  return Object.assign(
    {
      path: special.metadata.url,
      title: special.metadata.title,
      published_at: special.published_at
    },
    coverPresenter.getData(special)
  );
}

module.exports = {
  getData: getData,
  getListData: getListData
};

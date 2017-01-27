var markdown = require('markdown').markdown;

function getData(section) {
  return {
    type: section.type,
    centralized: section.centralized,
    description: section.description,
    title: (section.title) ? markdown.toHTML(section.title) : null,
    desktop: section.desktop.original,
    mobile: section.mobile.original || section.desktop.original
  };
}

module.exports = {
  getData
};

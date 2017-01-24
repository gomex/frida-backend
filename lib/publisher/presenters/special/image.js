var markdown = require('markdown').markdown;

function getData(section) {
  return {
    type: section.type,
    centralized: section.centralized,
    title: section.title,
    subtitle: (section.subtitle) ? markdown.toHTML(section.subtitle) : null,
    desktop: section.desktop.original,
    mobile: section.mobile.original || section.desktop.original
  };
}

module.exports = {
  getData
};

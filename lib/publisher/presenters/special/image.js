var markdown = require('markdown').markdown;

function getData(section) {
  return {
    type: section.type,
    centralized: section.centralized,
    title: section.title,
    subtitle: markdown.toHTML(section.subtitle),
    desktop: section.desktop.original,
    mobile: section.mobile.original || section.desktop.original
  };
}

module.exports = {
  getData
};

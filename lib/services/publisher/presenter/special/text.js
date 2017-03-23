var markdown = require('markdown').markdown;

function getData(section) {
  return {
    type: section.type,
    text: markdown.toHTML(section.text)
  };
}

module.exports = {
  getData
};

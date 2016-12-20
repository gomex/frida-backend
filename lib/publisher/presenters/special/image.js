function getData(section) {
  return {
    type: section.type,
    centralized: section.centralized,
    title: section.title,
    desktop: section.desktop.original,
    mobile: section.mobile.original || section.desktop.original
  };
}

module.exports = {
  getData
};

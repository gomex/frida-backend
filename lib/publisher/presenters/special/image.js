function getData(section) {
  return {
    type: section.type,
    centralized: section.centralized,
    title: section.title,
    desktop: section.desktop.link,
    mobile: section.mobile.link || section.desktop.link
  };
}

module.exports = {
  getData
};

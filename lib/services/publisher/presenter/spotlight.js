function getData(spotlight) {
  return {
    title: spotlight.metadata.title,
    link: spotlight.link,
    image: spotlight.image
  };
}

module.exports = {
  getData: getData,
  getListData: getData
};

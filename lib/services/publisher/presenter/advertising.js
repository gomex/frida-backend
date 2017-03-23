function getData(advertising) {
  return {
    title: advertising.metadata.title,
    link: advertising.link,
    image: advertising.image
  };
}

module.exports = {
  getData: getData,
  getListData: getData
};

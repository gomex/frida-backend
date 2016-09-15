function getData(advertising) {
  return {
    title: advertising.metadata.title,
    layout: advertising.metadata.layout,
    link: advertising.link,
    image: advertising.image
  };
}

module.exports = {
  getData: getData
};

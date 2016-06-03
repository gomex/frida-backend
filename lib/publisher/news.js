function getData(news) {
  return Object.assign({date: news.published_at}, news.metadata);
}

module.exports = {
  getData: getData
};

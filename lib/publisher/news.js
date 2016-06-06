function getData(news) {
  var data = Object.assign({date: news.published_at}, news, news.metadata);
  delete data.metadata;
  delete data.body;
  return data;
}

module.exports = {
  getData: getData
};

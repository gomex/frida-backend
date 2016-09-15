function getData(news) {
  if (news.metadata.cover && news.metadata.cover.link) {
    return {
      cover: {
        link: news.metadata.cover.link,
        thumbnail: news.metadata.cover.thumbnail,
        medium: news.metadata.cover.medium,
        small: news.metadata.cover.small,
        title: news.metadata.cover.title,
        credits: news.metadata.cover.credits,
        subtitle: news.metadata.cover.subtitle
      }
    };
  } else {
    return {};
  }
}

module.exports = {
  getData: getData
};

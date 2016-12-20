function getData(news) {
  if(news.metadata.cover && news.metadata.cover.link) {
    return {
      cover: Object.assign(
        getTitles(news.metadata.cover),
        getCover(news.metadata.cover),
        getCoverMobile(news.metadata.cover)
      )
    };
  } else {
    return {};
  }
}

function getTitles(cover) {
  return {
    title: cover.title,
    credits: cover.credits || null,
    subtitle: cover.subtitle || null
  };
}

function getCover(cover) {
  return {
    link: cover.link,
    original: cover.original,
    thumbnail: cover.thumbnail,
    medium: cover.medium,
    small: cover.small,
  };
}

function getCoverMobile(cover) {
  if (cover.mobile && cover.mobile.link) {
    return {
      mobile: getCover(cover.mobile)
    };
  } else {
    return {};
  }
}

module.exports = {
  getData: getData
};

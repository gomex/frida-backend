function getData(section) {
  var linksArray = [{
    title: section.link1_title,
    url: section.link1_url,
    cover: section.link1_cover
  }];

  if(section.link2_title !== '') {
    linksArray.push({
      title: section.link2_title,
      url: section.link2_url,
      cover: section.link2_cover
    });
  }

  return {
    type: section.type,
    title: section.title || null,
    links: linksArray
  };
}

module.exports = {
  getData
};

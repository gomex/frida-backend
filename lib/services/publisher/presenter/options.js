function getData(post, options) {
  if (options && options.content) {
    return {
      content: post.body
    };
  }
}

module.exports = {
  getData
};

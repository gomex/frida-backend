var _ = require('underscore');

function build(params) {
  return Object.assign({},
    buildTitle(params),
    buildStatus(params),
    buildLayout(params)
  );
}

function buildArrayParam(param, name) {
  if (!param) return {};

  function mapParam() {
    return _.map(param, (value) => {
      return { [name]: value };
    });
  }

  if (Array.isArray(param)) {
    return { $or: mapParam() };
  } else {
    return { [name]: param };
  }
}

function buildTitle(params) {
  if (!params.q) return {};

  return { 'metadata.title': new RegExp(params.q, 'i') };
}

function buildLayout(params) {
  return buildArrayParam(params.layouts, 'metadata.layout');
}

function buildStatus(params) {
  return buildArrayParam(params.status, 'status');
}

module.exports = {
  build: build
};

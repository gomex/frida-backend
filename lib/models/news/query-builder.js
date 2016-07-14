var _ = require('underscore');

function build(params) {
  var query = {};
  if (params.q) {
    query['metadata.title'] = new RegExp(params.q, 'i');
  }

  return Object.assign(query, buildStatus(params.status));
}

function mapStatus(status) {
  return _.map(status, (value) => {
    return { status: value };
  });
}

function buildStatus(status) {
  if (!status) return {};

  if (Array.isArray(status)) {
    return { $or: mapStatus(status) };
  } else {
    return { status: status };
  }
}

module.exports = {
  build: build
};

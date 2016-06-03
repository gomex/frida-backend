var _ = require('underscore');

function getDataFile(tabloid) {
  var areas = _.chain(tabloid.news)
    .groupBy('regional_area')
    .mapObject(function(val, key) {
      return {
        name: key,
        news: val
      };
    }).values().value();
  return Object.assign({issuu: tabloid.issuu, areas: areas});
}

module.exports = {
  getDataFile: getDataFile
};

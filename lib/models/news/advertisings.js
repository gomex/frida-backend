var News = require('../news');
var parallel = require('async').parallel;
var apply = require('async').apply;
var _ = require('underscore');

function query(area) {
  var criteria = {
    'metadata.layout': 'advertising',
    status: 'published',
    display_area: area
  };
  var options = {
    limit: 1,
    sort: '-published_at'
  };

  return apply(News.find, criteria, null, options);
}

function getList(callback) {
  parallel(
    [
      query('advertising_01'),
      query('advertising_02'),
      query('advertising_03'),
      query('advertising_04'),
      query('advertising_05'),
      query('advertising_06')
    ],
    (err, results) => {
      callback(err, _.flatten(results));
    }
  );
}

module.exports = {
  getList: getList
};

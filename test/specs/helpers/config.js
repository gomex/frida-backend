'use strict';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
  ROOT_DIRECTORY: __dirname + '/../../../',
  YEAR: getRandomInt(1900, 2015),
  MONTH: getRandomInt(1, 12)
};

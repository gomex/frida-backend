function getByName(_, res) {
  res.statusCode = 200;
  res.end();
}

module.exports = {
  getByName: getByName
};

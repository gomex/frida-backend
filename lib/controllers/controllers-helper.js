var buildSendResponse = function buildSendResponse(res, status, responseObject) {
  res.statusCode = status;
  res.json(responseObject);
};

module.exports = {
  buildSendResponse: buildSendResponse
};

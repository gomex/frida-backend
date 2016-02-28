var buildSendResponse = function buildSendResponse(res, status, responseObject) {
  res.statusCode = status;
  if(responseObject) {
    res.json(responseObject);
  } else {
    res.end();
  }
};

module.exports = {
  buildSendResponse: buildSendResponse
};

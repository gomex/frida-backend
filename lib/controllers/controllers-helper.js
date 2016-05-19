var buildSendResponse = function buildSendResponse(res, status, responseObject) {
  res.statusCode = status;
  if(responseObject) {
    res.json(responseObject);
  } else {
    res.end();
  }
};

var buildSendError = function(res, status, err) {
  console.error(err);
  res.statusCode = status;
  res.end();
};

module.exports = {
  buildSendResponse: buildSendResponse,
  buildSendError: buildSendError
};

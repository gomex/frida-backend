var sendResponse = function (res, status, obj) {
  res.statusCode = status;
  if(obj) {
    res.json(obj);
  } else {
    res.end();
  }
};

var sendError = function(res, status, err) {
  console.error(err);
  res.statusCode = status;
  res.end();
};

module.exports = {
  sendResponse: sendResponse,
  sendError: sendError
};

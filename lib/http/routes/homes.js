var express = require('express');
var router = express.Router();

router.route('/:name')
  .get((_, res) => {
    res.statusCode = 200;
    res.end();
  });

module.exports = router;

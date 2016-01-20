var express = require('express');

var router = express.Router();

router.route('/')

  .post(function(req, res) {
    return res.json({ success: true });
  });

module.exports = router;

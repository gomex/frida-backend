var express = require('express');

var simpleAuth = require('../simple-auth');

var router = express.Router();

var EDITOR = {
  username: process.env.EDITOR_USERNAME,
  password: process.env.EDITOR_PASSWORD
};

router.route('/')

  .post(simpleAuth(EDITOR), function(req, res) {
    return res.json({ success: true });
  });

module.exports = router;

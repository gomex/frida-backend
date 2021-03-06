require('app-module-path').addPath(__dirname + '/../../');

require('dotenv').config();
require('lib/db/initializer').connect(() => {});
var hexo = require('lib/services/hexo');

var mongoose = require('mongoose');

global.chai = require('chai');
global.expect = require('chai').expect;
global.sinon = require('sinon');
global.sinonChai = require('sinon-chai');
global.assert = require('assert');

global.chai.use(global.sinonChai);

before(() => {
  sinon.stub(hexo, 'generate').yields();
});

after(() => {
  hexo.generate.restore();
});

beforeEach(() => {
  global.sandbox = sinon.sandbox.create();
});

afterEach((done) => {
  global.sandbox.restore();
  mongoose.connection.db.dropDatabase(done);
});

global.given = function(name, block) {
  var cache = null;

  beforeEach(() => {
    var property = {
      configurable: true,
      get: function() {
        return cache != null ? cache : cache = block.call(global);
      }
    };
    Object.defineProperty(global, name, property);
  });

  afterEach(() => {
    delete global[name];
    cache = null;
  });
};

global.subj = global.given;

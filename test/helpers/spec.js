require('dotenv').config();

global.chai = require('chai');
global.expect = require('chai').expect;
global.sinon = require('sinon');
global.sinonChai = require('sinon-chai');
global.assert = require('assert');

global.chai.use(global.sinonChai);

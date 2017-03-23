/*eslint no-undef: "off"*/

const columnist = require('lib/services/columnist');
const columnistsModel = require('lib/models/columnist');
const hexoSource = require('lib/services/hexo/source');
var YAML = require('js-yaml');

describe('lib/services/columnist.js', () => {
  describe('write', () => {
    var subject = (callback) => columnist.write(callback);

    given('list', () => ([
      {
        email: 'foo@mail',
        name: 'foo'
      },
      {
        email: 'bar@mail',
        name: 'bar'
      }
    ]));

    given('text', () => YAML.dump({
      'foo@mail': {
        name: 'foo'
      },
      'bar@mail': {
        name: 'bar'
      }
    }));

    beforeEach(() => {
      sandbox.stub(columnistsModel, 'all').returns(list);
      sandbox.spy(hexoSource, 'write');
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('writes columnists', (done) => {
      subject((err) => {
        expect(hexoSource.write).to.have.been.calledWith('_data/columnists.yml');

        done(err);
      });
    });
  });
});

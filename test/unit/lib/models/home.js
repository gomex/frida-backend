/*eslint no-undef: "off"*/

var Home = require('../../../../lib/models/home');

describe('unit/lib/models/home.js', () => {
  describe('getByName', () => {
    var subject = (callback) => Home.getByName(name, callback);

    given('name', () => 'some_name');

    given('criteria', () => ({
      name: name
    }));

    given('expected', () => ({
      foo: 'bar'
    }));

    beforeEach(() => {
      sandbox.stub(Home, 'find').yields(null, [expected]);
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('searches', (done) => {
      subject((err) => {
        expect(Home.find).to.have.been.calledWith(criteria);

        done(err);
      });
    });

    it('returns', (done) => {
      subject((err, national) => {
        expect(national).to.equal(expected);

        done(err);
      });
    });
  });
});

/*eslint no-undef: "off"*/

var Home = require('../../../../lib/models/home');

describe('unit/lib/models/home.js', () => {
  describe('findByName', () => {
    var subject = (callback) => Home.findByName(name, callback);

    given('name', () => 'some_name');

    given('criteria', () => ({
      name: name
    }));

    given('expected', () => ({
      foo: 'bar'
    }));

    beforeEach(() => {
      sandbox.stub(Home, 'findOne').yields(null, expected);
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('searches', (done) => {
      subject((err) => {
        expect(Home.findOne).to.have.been.calledWith(criteria);

        done(err);
      });
    });

    it('returns', (done) => {
      subject((err, national) => {
        expect(national).to.equal(expected);

        done(err);
      });
    });

    describe('when is not found', () => {
      beforeEach(() => {
        Home.findOne.restore();
        sandbox.stub(Home, 'findOne').yields(null, null);
      });

      it('has error', (done) => {
        subject((err) => {
          expect(err).to.exist;

          done();
        });
      });
    });
  });
});

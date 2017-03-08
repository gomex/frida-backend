/*eslint no-undef: "off"*/

var controller = require('../../../../lib/controllers/news');
var republisher = require('../../../../lib/services/publisher/republisher');

describe('/lib/controllers/news', () => {
  describe('.republishAll', () => {
    var subject = (callback) => controller.republishAll(req, {end: callback}, callback);

    given('req', () => ({}));
    given('res', () => ({}));

    beforeEach(() => {
      sandbox.stub(republisher, 'publish').yields(null);
    });

    it('succeeds', (done) => {
      subject(() => {
        done();
      });
    });

    it('republishes all news', (done) => {
      subject((err) => {
        expect(republisher.publish).to.have.been.called;

        done(err);
      });
    });

    context('when republishes fails', () => {
      given('message', () => 'some error');

      beforeEach(() => {
        republisher.publish.restore();
        sandbox.stub(republisher, 'publish').yields(message);
      });

      it('returns error', (done) => {
        subject((error) => {
          expect(error).to.deep.equals({status: 500, error: message});
          done();
        });
      });
    });
  });
});

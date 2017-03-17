/*eslint no-undef: "off"*/

var News = require('../../../../../lib/models/news');
var worker = require('../../../../../lib/services/publisher/worker');
var republisher = require('../../../../../lib/services/publisher/republisher');
var postFactory = require('../../../../factories/post-attributes').post;

describe('lib/services/publisher/republisher', () => {
  describe('.publish', () => {
    var subject = (callback) => republisher.publish(callback);

    given('post', () => new News(postFactory.build({
      status: 'published'
    })));

    beforeEach((done) => { post.save(done); });

    beforeEach(() => {
      sandbox.stub(worker, 'publishLater').yields(null);
    });

    it('succeeds', (done) => {
      subject(done);
    });

    it('publishes', (done) => {
      subject((err) => {
        expect(worker.publishLater).to.have.been.called;

        done(err);
      });
    });
  });
});

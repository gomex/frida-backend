/*eslint no-undef: "off"*/

var News = require('../../../../lib/models/news');
var worker = require('../../../../lib/services/publisher/worker');
var scheduler = require('../../../../lib/services/scheduler');
var postFactory = require('../../../factories/post-attributes').post;

describe('app/services/scheduler', () => {
  describe('.publish', () => {
    var subject = (callback) => scheduler.publish(callback);

    given('post', () => new News(postFactory.build({
      status: 'scheduled',
      published_at: new Date(2017, 1, 1)
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

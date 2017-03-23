/*eslint no-undef: "off"*/

var News = require('lib/models/news');
var worker = require('lib/services/publisher/worker');
var recover = require('lib/services/publisher/recover');
var postFactory = require('test/factories/post-attributes').post;

describe('lib/services/publisher/recover', () => {
  describe('.publish', () => {
    var subject = (callback) => recover.publish(callback);

    given('post', () => new News(postFactory.build({
      status: 'publishing'
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

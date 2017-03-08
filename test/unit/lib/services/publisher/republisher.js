/*eslint no-undef: "off"*/

var News = require('../../../../../lib/models/news');
var publisher = require('../../../../../lib/models/publisher');
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
      sandbox.stub(publisher, 'publishLater').yields(null);
    });

    it('succeeds', (done) => {
      subject(done);
    });

    it('publishes scheduleds', (done) => {
      subject((err) => {
        expect(publisher.publishLater).to.have.been.calledWithMatch({
          metadata: {title: post.metadata.title}
        });

        done(err);
      });
    });
  });
});

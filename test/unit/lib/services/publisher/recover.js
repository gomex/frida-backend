/*eslint no-undef: "off"*/

var News = require('../../../../../lib/models/news');
var publisher = require('../../../../../lib/models/publisher');
var recover = require('../../../../../lib/services/publisher/recover');
var postFactory = require('../../../../factories/post-attributes').post;

describe.only('lib/services/publisher/recover', () => {
  describe('.publish', () => {
    var subject = (callback) => recover.publish(callback);

    given('post', () => new News(postFactory.build({
      status: 'publishing'
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

/*eslint no-undef: "off"*/

var worker = require('../../../../../lib/services/publisher/worker');
var publisher = require('../../../../../lib/services/publisher');
var News = require('../../../../../lib/models/news');
var hexoSource = require('../../../../../lib/publisher/hexo_source');
var hexo = require('../../../../../lib/publisher/hexo');
var postFactory = require('../../../../factories/post-attributes').post;
var homePublisher = require('../../../../../lib/services/publisher/home');
var listPublisher = require('../../../../../lib/services/publisher/list');
var mongoose = require('mongoose');

describe('lib/services/publisher/worker.js', () => {
  describe('run', () => {
    var subject = (callback) =>  worker.run(tasks, callback);

    given('postId', () => mongoose.Types.ObjectId());
    given('post', () => new News(postFactory.build({ _id: postId })));
    given('tasks', () => ([postId]));

    beforeEach(() => {
      sandbox.stub(publisher, 'publish').yields();
      sandbox.stub(publisher, 'unpublish').yields();
      sandbox.stub(listPublisher, 'publishAll').yields();
      sandbox.stub(homePublisher, 'publishAll').yields();
      sandbox.stub(hexoSource, 'removePosts').yields();
    });

    it('succeeds', (done) => {
      subject(done);
    });

    it('remove posts', (done) => {
      subject((err) => {
        expect(hexoSource.removePosts).to.have.been.called;

        done(err);
      });
    });

    it('publishes lists', (done) => {
      subject((err) => {
        expect(listPublisher.publishAll).to.have.been.called;

        done(err);
      });
    });

    it('publishes homes', (done) => {
      subject((err) => {
        expect(homePublisher.publishAll).to.have.been.called;

        done(err);
      });
    });

    it('generates site', (done) => {
      subject((err) => {
        expect(hexo.generate).to.have.been.calledWith('publish');

        done(err);
      });
    });

    context('when publishing', () => {
      beforeEach(() => {
        post.status = 'publishing';
      });

      beforeEach((done) => { post.save(done); });

      it('publishes news', (done) => {
        subject((err) => {
          var posts = publisher.publish.args[0];
          expect(posts[0]._id).to.deep.equal(postId);

          done(err);
        });
      });
    });

    context('when unpublishing', () => {
      beforeEach(() => {
        post.status = 'unpublishing';
      });

      beforeEach((done) => { post.save(done); });

      it('publishes news', (done) => {
        subject((err) => {
          var posts = publisher.unpublish.args[0];
          expect(posts[0]._id).to.deep.equal(postId);

          done(err);
        });
      });
    });
  });

  describe('.publishLater', () => {
    var subject = (news, callback) => {
      worker.publishLater([news], true, (err) => {
        if (err) return callback(err);

        News.findOne({}, callback);
      });
    };

    given('news', () => new News(postFactory.build({ status: 'draft' })));

    beforeEach((done) => { news.save(done); });

    it('sets news status to "publishing"', (done) => {
      subject(news, (err, published) => {
        expect(published.status).to.be.equal('publishing');

        done(err);
      });
    });
  });

  describe('.unpublishLater', () => {
    var subject = (news, callback) => { worker.unpublishLater(news, callback); };

    given('news', () => new News(postFactory.build(
      {
        published_at: new Date(),
        updated_at: new Date(),
        status: 'published'
      }
    )));

    it('sets news status to "unpublishing"', (done) => {
      subject(news, (err, unpublishedNews) => {
        expect(unpublishedNews.status).to.be.equal('unpublishing');
        done(err);
      });
    });
  });
});

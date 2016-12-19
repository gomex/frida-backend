/*eslint no-undef: "off"*/

var News = require('../../../../lib/models/news');
var newsFactory = require('../../../factories/news-attributes').news;
var metadataFactory     = require('../../../factories/news-attributes').metadata;

describe('news', () => {
  var behaviourAsIsLayout = (name, layout) => {
    subj('isLayout', () => news[name]());

    given('news', () => new News(newsFactory.build({metadata: metadata})));
    given('metadata', () => metadataFactory.build({layout: layout}));

    it('is true', () => {
      expect(isLayout).to.be.true;
    });

    describe('when is not', () => {
      given('metadata', () => metadataFactory.build({layout: 'absent_layout'}));

      it('is false', () => {
        expect(isLayout).to.be.false;
      });
    });
  };

  var behaviourAsIsStatus = (name, status) => {
    subj('isStatus', () => news[name]());

    given('news', () => new News(newsFactory.build({status: status})));

    it('is true', () => {
      expect(isStatus).to.be.true;
    });

    describe('when is not', () => {
      given('news', () => new News(newsFactory.build({status: 'absent_status'})));

      it('is false', () => {
        expect(isStatus).to.be.false;
      });
    });
  };

  describe('#isPost', () => {
    behaviourAsIsLayout('isPost', 'post');
  });

  describe('#isColumn', () => {
    behaviourAsIsLayout('isColumn', 'column');
  });

  describe('#isTabloid', () => {
    behaviourAsIsLayout('isTabloid', 'tabloid');
  });

  describe('#isTabloidNews', () => {
    behaviourAsIsLayout('isTabloidNews', 'tabloid_news');
  });

  describe('#isPhotoCaption', () => {
    behaviourAsIsLayout('isPhotoCaption', 'photo_caption');
  });

  describe('#isAdvertising', () => {
    behaviourAsIsLayout('isAdvertising', 'advertising');
  });

  describe('#isSpotlight', () => {
    behaviourAsIsLayout('isSpotlight', 'spotlight');
  });

  describe('#isSpecial', () => {
    behaviourAsIsLayout('isSpecial', 'special');
  });

  describe('#isDraft', () => {
    behaviourAsIsStatus('isDraft', 'draft');
  });

  describe('#isPublished', () => {
    behaviourAsIsStatus('isPublished', 'published');
  });

  describe('#isChanged', () => {
    behaviourAsIsStatus('isChanged', 'changed');
  });

  describe('#updateSanitized', () => {
    var subject = (cb) => { news.updateSanitized(attributes, cb); };

    given('news', () => new News(newsFactory.build({
      status: 'draft'
    })));
    given('attributes', () => ({
      foo: 'bar',
      status: 'status',
      created_at:  'created_at',
      published_at: 'published_at',
      metadata: {
        url: 'url'
      }
    }));
    given('updatedAt', () => Date.now());

    beforeEach(() => {
      sandbox.useFakeTimers(updatedAt);
      sandbox.stub(news, 'save').yields(null);
    });

    it('exists', () => {
      expect(news.updateSanitized).to.exist;
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('copies attributes', (done) => {
      subject((err) => {
        expect(news.foo).to.equal(attributes.foo);

        done(err);
      });
    });

    it('does not copy server fields', (done) => {
      subject((err) => {
        expect(news.status).to.not.equal(attributes.status);
        expect(news.created_at).to.not.equal(attributes.created_at);
        expect(news.published_at).to.not.equal(attributes.published_at);
        expect(news.metadata.url).to.not.equal(attributes.metadata.url);

        done(err);
      });
    });

    it('updates update_at', (done) => {
      subject((err) => {
        expect(news.updated_at.getTime()).to.equal(updatedAt);

        done(err);
      });
    });

    it('saves attributes', (done) => {
      subject((err) => {
        expect(news.save).to.have.been.called;

        done(err);
      });
    });

    describe('when status is published', () => {
      given('news', () => new News(newsFactory.build({
        status: 'published'
      })));

      it('sets status to changed', (done) => {
        subject((err) => {
          expect(news.status).to.equal('changed');

          done(err);
        });
      });
    });

    describe('when the cover link is not set', () => {
      given('attributes', () => ({
        metadata: {
          cover: {
            link: null
          }
        }
      }));

      it('removes cover', (done) => {
        subject((err) => {
          assert(news.metadata.cover, null);

          done(err);
        });
      });
    });

    describe('when there is a empty value on related_news', () => {
      given('attributes', () => ({
        related_news: ['', 'some_id']
      }));

      it('it saves as null', (done) => {
        subject((err) => {
          assert(news.related_news, 'null', 'some_id');

          done(err);
        });
      });
    });
  });
});

/*eslint no-undef: "off"*/

var News = require('../../../../lib/models/news');
var tabloidFactory = require('../../../factories/tabloid-attributes').tabloid;
var newsFactory = require('../../../factories/news-attributes').news;

describe('tabloid', () => {
  describe('#isTabloid', () => {
    subj('isTabloid', () => tabloid.isTabloid());

    given('tabloid', () => new News(tabloidFactory.build()));

    it('is true', () => {
      expect(isTabloid).to.be.true;
    });

    describe('when is not', () => {
      given('tabloid', () => new News(newsFactory.build()));

      it('is false', () => {
        expect(isTabloid).to.be.false;
      });
    });
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
  });
});

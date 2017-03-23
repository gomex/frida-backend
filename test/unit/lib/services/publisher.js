/*eslint no-undef: "off"*/
'use strict';

var _ = require('lodash');
var publisher = require('lib/services/publisher');
var News = require('lib/models/news');
var tabloids = require('lib/models/news/tabloids');
var photoCaptions = require('lib/models/news/photo-captions');
var hexo = require('lib/services/hexo');
var site = require('lib/services/site');
var newsFactory = require('test/factories/news-attributes').news;
var metadataFactory = require('test/factories/news-attributes').metadata;
var tabloidFactory = require('test/factories/tabloid-attributes').tabloid;
var tabloidNewsFactory = require('test/factories/tabloid-news-attributes').tabloid;
var photoCaptionFactory = require('test/factories/photo-caption-attributes').photoCaption;

describe('publisher', () => {
  describe('.publish', () => {
    var subject = (news, callback) => publisher.publish(news, callback);

    given('news', () => new News(newsFactory.build(
      {
        published_at: new Date(),
        updated_at: new Date(),
        status: 'draft'
      }
    )));

    beforeEach(() => {
      sandbox.stub(news, 'save').yields(null);
      sandbox.stub(hexo, 'publish').yields(null);
    });

    describe('when news is not published', () => {
      it('updates status on database', (done) => {
        subject(news, (err) => {
          expect(news.save).to.have.been.called;

          done(err);
        });
      });

      it('creates news data file', (done) => {
        subject(news, (err) => {
          expect(hexo.publish).to.have.been.called;

          done(err);
        });
      });

      it('sets url', (done) => {
        subject(news, (err, publishedNews) => {
          expect(publishedNews.metadata.url).to.exist;

          done(err);
        });
      });
    });

    describe('when news is already published', () => {
      describe('and was modified', () => {
        var metadata = metadataFactory.build({ url: '/2016/05/21/what' });
        given('news', () => new News(newsFactory.build({
          metadata: metadata,
          published_at: new Date(1000),
          updated_at: new Date(),
          status: 'changed'
        })));

        beforeEach(() => {
          sandbox.stub(news, 'save').yields(null);
        });

        it('does not change original published_at date', (done) => {
          subject(_.clone(news), (err, publishedNews) => {
            expect(publishedNews.published_at).to.be.equal(news.published_at);

            done(err);
          });
        });

        it('does not change url if title changes', (done) => {
          var oldUrl = news.metadata.url;
          news.metadata.title = 'different title';

          subject(news, (err, publishedNews) => {
            expect(publishedNews.metadata.url).to.be.equal(oldUrl);

            done(err);
          });
        });
      });

      describe('and was not changed', () => {
        var metadata = metadataFactory.build();
        given('news', () => new News(newsFactory.build({
          metadata: metadata,
          published_at: new Date(),
          updated_at: new Date(1000),
          status: 'published'
        })));

        beforeEach(() => {
          sandbox.stub(news, 'save').yields(null);
        });

        it('returns error', (done) => {
          subject(news, (err) => {
            expect(err).to.exist;

            done();
          });
        });
      });
    });

    describe('when is a tabloid', () => {
      given('aTabloid', () => new News(tabloidFactory.build({
        status: 'draft'
      })));
      given('newsList', () => [new News(tabloidNewsFactory.build()), new News(tabloidNewsFactory.build())]);

      beforeEach(() => {
        sandbox.stub(tabloids, 'findNews').yields(null, newsList);
        sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
      });

      it('searches news', (done) => {
        subject(aTabloid, (err) => {
          expect(tabloids.findNews).to.have.been.calledWith(aTabloid);

          done(err);
        });
      });

      it('publishes tabloid', (done) => {
        subject(aTabloid, (err) => {
          expect(hexo.publish).to.have.been.calledWith(aTabloid);

          done(err);
        });
      });

      it('enriches tabloid with news', (done) => {
        subject(aTabloid, (err) => {
          expect(aTabloid.news).to.equal(newsList);

          done(err);
        });
      });

      it('republishes tabloid news', (done) => {
        subject(aTabloid, (err) => {
          expect(hexo.publish).to.have.been.calledWith(newsList[0]);
          expect(tabloids.findTabloid).to.have.been.calledWith(newsList[0]);

          done(err);
        });
      });
    });

    describe('when is a tabloid news', () => {
      given('tabloidNews', () => new News(tabloidNewsFactory.build({
        status: 'draft',
        region: 'tabloid_mg'
      })));
      given('aTabloid', () => new News(tabloidFactory.build()));

      beforeEach(() => {
        sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
      });

      it('publishes news', (done) => {
        subject(tabloidNews, (err) => {
          expect(hexo.publish).to.have.been.calledWith(tabloidNews);

          done(err);
        });
      });

      it('searches tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(tabloids.findTabloid).to.have.been.calledWith(tabloidNews);

          done(err);
        });
      });

      it('publishes tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(hexo.publish).to.have.been.calledWith(
            sandbox.match({edition: aTabloid.edition})
          );

          done(err);
        });
      });

      describe('when there is no tabloid', () => {
        given('aTabloid', () => undefined);

        beforeEach(() => {
          tabloids.findTabloid.restore();
          sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
        });

        it('does not publishes tabloid', (done) => {
          subject(tabloidNews, (err) => {
            expect(hexo.publish).to.not.have.been.calledWith(aTabloid);

            done(err);
          });
        });
      });
    });

    describe('when is a photo_caption', () => {
      given('photoCaption', () => new News(photoCaptionFactory.build({
        status: 'draft'
      })));

      given('list', () => [
        photoCaptionFactory.build({metadata: metadataFactory.build({url: 'url'})}
      )]);

      beforeEach(() => {
        sandbox.stub(photoCaptions, 'getRelateds').yields(null, list);
      });

      it('searches relateds', (done) => {
        subject(photoCaption, (err) => {
          expect(photoCaptions.getRelateds).to.have.been.calledWith(photoCaption);

          done(err);
        });
      });

      it('sets related_photo_captions', (done) => {
        subject(photoCaption, (err) => {
          expect(photoCaption.related_photo_captions).to.eql(list);

          done(err);
        });
      });
    });
  });

  describe('.remove', () => {
    it('exists', () => {
      expect(publisher.remove).to.exist;
    });

    describe('when news status is not "draft"', () => {
      given('news', () => new News(newsFactory.build({status: 'published'})));

      beforeEach(() => {
        sandbox.stub(news, 'save').yields(null);
      });

      it('status was not changed to "deleted"', (done) => {
        publisher.remove(news, (err) => {
          expect(news.status).to.not.equal('deleted');

          done(err);
        });
      });

      it('news was not saved in dataBase', (done) => {
        publisher.remove(news, (err) => {
          expect(news.save).to.not.have.been.called;

          done(err);
        });
      });
    });

    describe('when status is "draft"', () => {
      given('news', () => new News(newsFactory.build({status: 'draft'})));

      beforeEach(() => {
        sandbox.stub(news, 'save').yields(null);
      });

      it('news status was changed to "deleted"', (done) => {
        publisher.remove(news, (err) => {
          expect(news.status).to.equal('deleted');

          done(err);
        });
      });

      it('news was saved in dataBase', (done) => {
        publisher.remove(news, (err) => {
          expect(news.save).to.have.been.called;

          done(err);
        });
      });
    });
  });

  describe('.unpublish', () => {
    var subject = (news, callback) => publisher.unpublish(news, callback);

    var metadata = metadataFactory.build({ url: '/2017/03/03/bla-bla/' });
    given('news', () => new News(newsFactory.build({metadata: metadata, status: 'published' })));
    given('updatedNews', () => Object.assign({status: 'draft'}, news));

    beforeEach(() => {
      sandbox.stub(news, 'save').yields(null, updatedNews);
      sandbox.stub(site, 'remove').yields(null);
    });

    it('succeeds', (done) => {
      subject(news, done);
    });

    it('saves changes', (done) => {
      subject(news, (err) => {
        expect(news.save).to.have.been.called;

        done(err);
      });
    });

    it('delegates to site', (done) => {
      subject(news, (err, news) => {
        expect(site.remove).to.have.been.calledWith(news.metadata.url);

        done(err);
      });
    });

    it('returns updated news', (done) => {
      subject(news, (err, news) => {
        expect(news.status).to.equal('draft');

        done(err);
      });
    });

    describe('when is a tabloid news', () => {
      given('tabloidNews', () => new News(tabloidNewsFactory.build()));
      given('aTabloid', () => new News(tabloidFactory.build()));

      beforeEach(() => {
        sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
        sandbox.stub(hexo, 'publish').yields(null);
      });

      it('searches tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(tabloids.findTabloid).to.have.been.calledWith(tabloidNews);

          done(err);
        });
      });

      it('publishes tabloid', (done) => {
        subject(tabloidNews, (err) => {
          expect(hexo.publish).to.have.been.calledWith(aTabloid);

          done(err);
        });
      });

      describe('when there is no tabloid', () => {
        given('aTabloid', () => undefined);

        beforeEach(() => {
          tabloids.findTabloid.restore();
          sandbox.stub(tabloids, 'findTabloid').yields(null, aTabloid);
        });

        it('does not publishes tabloid', (done) => {
          subject(tabloidNews, (err) => {
            expect(hexo.publish).to.not.have.been.calledWith(aTabloid);

            done(err);
          });
        });
      });
    });
  });
});

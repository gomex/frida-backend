/*eslint no-undef: "off"*/

var News = require('lib/models/news');
var newsFactory = require('test/factories/news-attributes').news;
var metadataFactory = require('test/factories/news-attributes').metadata;

var postFactory = require('test/factories/post-attributes').post;
var postMetadataFactory = require('test/factories/post-attributes').metadata;

var columnFactory = require('test/factories/column-attributes').column;
var columnMetadataFactory = require('test/factories/column-attributes').metadata;

var tabloidNewsFactory = require('test/factories/tabloid-news-attributes').tabloid;
var tabloidNewsMetadataFactory = require('test/factories/tabloid-news-attributes').metadata;

var specialFactory = require('test/factories/special-attributes').special;
var specialMetadataFactory = require('test/factories/special-attributes').metadata;

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

  describe('#isScheduled', () => {
    behaviourAsIsStatus('isScheduled', 'scheduled');
  });

  describe('#isPublishing', () => {
    behaviourAsIsStatus('isPublishing', 'publishing');
  });

  describe('#updateSanitized', () => {
    var subject = (cb) => { news.updateSanitized(attributes, cb); };

    given('news', () => new News(newsFactory.build({
      status: 'draft'
    })));
    given('attributes', () => ({
      foo: 'bar',
      created_at:  'created_at',
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
        expect(news.created_at).to.not.equal(attributes.created_at);
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

  describe('generates url', () => {
    given('news', () => new News(newsFactory.build({metadata: metadata, published_at: new Date(2017, 0, 2)})));
    given('metadata', () => metadataFactory.build({title: 'golpe no brasil'}));


    it('exists', () => {
      expect(news.generateUrl).to.exist;
    });

    it('url follows pattern YYYY/MM/DD/title', () => {
      news.generateUrl();
      expect(news.metadata.url).to.equal('/2017/01/02/golpe-no-brasil/');
    });

    context('when url is already set', () => {
      given('metadata', () => metadataFactory.build({url: 'some_url'}));

      it('url follows pattern YYYY/MM/DD/title/', () => {
        news.generateUrl();
        expect(news.metadata.url).to.equal('some_url');
      });
    });

    context('when is special', () => {
      given('metadata', () => metadataFactory.build({layout: 'special', title: 'golpe no brasil'}));

      it('url follows pattern /title/', () => {
        news.generateUrl();
        expect(news.metadata.url).to.equal('/especiais/golpe-no-brasil/');
      });
    });
  });

  describe('.byArea', () => {
    var subject = (callback) => News.find().byArea(area).exec(callback);

    given('area', () => 'some_area');

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    context('filter areas', () => {
      given('news', () => new News(newsFactory.build({metadata: metadata})));
      given('metadata', () => metadataFactory.build({area: area}));

      given('newsWrongArea', () => new News(newsFactory.build()));

      beforeEach((done) => { news.save(done); });
      beforeEach((done) => { newsWrongArea.save(done); });

      it('filters by area', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(1);
          expect(result.pop().metadata.title).to.equal(news.metadata.title);

          done(err);
        });
      });
    });

    context('filter layouts', () => {
      given('post', () => new News(postFactory.build({metadata: postMetadata})));
      given('postMetadata', () => postMetadataFactory.build({area: area}));

      given('tabloidNews', () => new News(tabloidNewsFactory.build({metadata: tabloidNewsMetadata})));
      given('tabloidNewsMetadata', () => tabloidNewsMetadataFactory.build({area: area}));

      given('special', () => new News(specialFactory.build({metadata: specialMetadata})));
      given('specialMetadata', () => specialMetadataFactory.build({area: area}));

      given('wrongLayout', () => new News(newsFactory.build({metadata: wrongLayoutMetadata})));
      given('wrongLayoutMetadata', () => metadataFactory.build({area: area, layout: 'wrong_layout'}));


      beforeEach((done) => { post.save(done); });
      beforeEach((done) => { tabloidNews.save(done); });
      beforeEach((done) => { special.save(done); });
      beforeEach((done) => { wrongLayout.save(done); });

      it('filters by layouts with areas', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(3);
          expect(result[0].metadata.title).not.to.equal(wrongLayout.metadata.title);
          expect(result[1].metadata.title).not.to.equal(wrongLayout.metadata.title);
          expect(result[2].metadata.title).not.to.equal(wrongLayout.metadata.title);

          done(err);
        });
      });
    });
  });

  describe('.byRegion', () => {
    var subject = (callback) => News.find().byRegion(region).exec(callback);

    given('region', () => 'some_region');

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    context('filter region', () => {
      given('news', () => new News(tabloidNewsFactory.build({region: region})));

      given('newsWronRegion', () => new News(tabloidNewsFactory.build()));

      beforeEach((done) => { news.save(done); });
      beforeEach((done) => { newsWronRegion.save(done); });

      it('filters by area', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(1);
          expect(result.pop().metadata.title).to.equal(news.metadata.title);

          done(err);
        });
      });
    });

    context('filter tabloidNews', () => {
      given('tabloidNews', () => new News(tabloidNewsFactory.build({region: region})));
      given('post', () => new News(postFactory.build({region: region})));

      beforeEach((done) => { post.save(done); });
      beforeEach((done) => { tabloidNews.save(done); });

      it('filters by layouts with areas', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(1);
          expect(result[0].metadata.title).to.equal(tabloidNews.metadata.title);

          done(err);
        });
      });
    });
  });

  describe('.byColumnist', () => {
    var subject = (callback) => News.find().byColumnist(columnist).exec(callback);

    given('columnist', () => 'some_columnist');

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    context('filter columnist', () => {
      given('news', () => new News(columnFactory.build({metadata})));
      given('metadata', () => columnMetadataFactory.build({columnist}));

      given('newsWronColumn', () => new News(columnFactory.build()));

      beforeEach((done) => { news.save(done); });
      beforeEach((done) => { newsWronColumn.save(done); });

      it('filters by columnist', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(1);
          expect(result.pop().metadata.title).to.equal(news.metadata.title);

          done(err);
        });
      });
    });

    context('filter columns', () => {
      given('column', () => new News(tabloidNewsFactory.build({metadata})));
      given('metadata', () => columnMetadataFactory.build({columnist}));

      given('post', () => new News(postFactory.build({postMetadata})));
      given('postMetadata', () => postMetadataFactory.build({columnist}));

      beforeEach((done) => { column.save(done); });
      beforeEach((done) => { post.save(done); });

      it('filters by columns', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(1);
          expect(result[0].metadata.title).to.equal(column.metadata.title);

          done(err);
        });
      });
    });
  });

  describe('.byService', () => {
    var subject = (callback) => News.find().byService(service).exec(callback);

    given('service', () => 'some_service');

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    context('layouts with tags', () => {
      given('news', () => new News(postFactory.build({tags: [service]})));
      given('tabloidNews', () => new News(tabloidNewsFactory.build({tags: [service]})));

      given('newsWrongLayout', () => new News(columnFactory.build({tags: [service]})));

      beforeEach((done) => { news.save(done); });
      beforeEach((done) => { tabloidNews.save(done); });
      beforeEach((done) => { newsWrongLayout.save(done); });

      it('filters', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(2);
          expect(result[0].metadata.title).to.equal(news.metadata.title);
          expect(result[1].metadata.title).to.equal(tabloidNews.metadata.title);

          done(err);
        });
      });
    });

    context('tags of service', () => {
      given('news', () => new News(postFactory.build({tags: ['wrong_tag', service]})));
      given('newsWrongTag', () => new News(postFactory.build({tags: ['wrong_tag']})));

      beforeEach((done) => { news.save(done); });
      beforeEach((done) => { newsWrongTag.save(done); });

      it('filters', (done) => {
        subject((err, result) => {
          expect(result.length).to.equal(1);
          expect(result[0].metadata.title).to.equal(news.metadata.title);

          done(err);
        });
      });
    });
  });

  describe('.publisheds', () => {
    var subject = (callback) => News.find().publisheds().exec(callback);

    given('news', () => new News(newsFactory.build({status: 'published'})));
    given('news2', () => new News(newsFactory.build()));

    beforeEach((done) => { news.save(done); });
    beforeEach((done) => { news2.save(done); });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('filters by status', (done) => {
      subject((err, result) => {
        expect(result.length).to.equal(1);
        expect(result.pop().metadata.title).to.equal(news.metadata.title);

        done(err);
      });
    });
  });

  describe('.byMonth', () => {
    var subject = (callback) => News.find().byMonth(year, month).exec(callback);

    given('year', () => 2017);
    given('month', () => 1);

    given('wrongMonth1', () => 0);
    given('wrongMonth2', () => 2);

    given('publishedAt1', () => new Date(year, month, 1));
    given('publishedAt2', () => new Date(year, month, 15));
    given('publishedAt3', () => new Date(year, month, 28));

    given('newsWithWrongMonth1', () => new Date(year, wrongMonth1, 31));
    given('newsWithWrongMonth2', () => new Date(year, wrongMonth2, 1));

    given('news1', () => new News(newsFactory.build({ published_at: publishedAt1 })));
    given('news2', () => new News(newsFactory.build({ published_at: publishedAt2 })));
    given('news3', () => new News(newsFactory.build({ published_at: publishedAt3 })));

    given('news1Wrong', () => new News(newsFactory.build({ published_at: newsWithWrongMonth1 })));
    given('news2Wrong', () => new News(newsFactory.build({ published_at: newsWithWrongMonth2 })));

    beforeEach((done) => { news1.save(done); });
    beforeEach((done) => { news2.save(done); });
    beforeEach((done) => { news3.save(done); });

    beforeEach((done) => { news1Wrong.save(done); });
    beforeEach((done) => { news2Wrong.save(done); });


    it('succeeds', (done) => {
      subject(done);
    });

    it('filters by date', (done) => {
      subject((err, list) => {
        expect(list[0].metadata.title).to.equal(news1.metadata.title);
        expect(list[1].metadata.title).to.equal(news2.metadata.title);
        expect(list[2].metadata.title).to.equal(news3.metadata.title);
        expect(list.length).to.equal(3);

        done(err);
      });
    });

    context('Month with different numbers of days', () => {

      given('year', () => 2017);
      given('month', () => 3);
      
      given('publishedAt1', () => new Date(year, month, 30));
      
      given('news1', () => new News(newsFactory.build({ published_at: publishedAt1 })));
      
      beforeEach((done) => { news1.save(done); });

      it('Month with 28 days', (done) => {
        subject((err, list) => {
          expect(list[0].metadata.title).to.equal(news1.metadata.title);
          expect(list.length).to.equal(1);

          done(err);
        });
      });

    });
  });

  describe('.byLayouts', () => {
    var subject = (callback) => News.find().byLayouts(layouts).exec(callback);

    given('layouts', () => (['post', 'tabloid_news', 'special']));

    given('post', () => new News(postFactory.build()));
    given('tabloidNews', () => new News(tabloidNewsFactory.build()));
    given('special', () => new News(specialFactory.build()));
    given('wrongLayout', () => new News(newsFactory.build({metadata: wrongLayoutMetadata})));
    given('wrongLayoutMetadata', () => metadataFactory.build({layout: 'wrong_layout'}));

    beforeEach((done) => { post.save(done); });
    beforeEach((done) => { tabloidNews.save(done); });
    beforeEach((done) => { special.save(done); });
    beforeEach((done) => { wrongLayout.save(done); });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('filters by layout', (done) => {
      subject((err, result) => {
        expect(result.length).to.equal(3);
        expect(result[0].metadata.title).not.to.equal(wrongLayout.metadata.title);
        expect(result[1].metadata.title).not.to.equal(wrongLayout.metadata.title);
        expect(result[2].metadata.title).not.to.equal(wrongLayout.metadata.title);

        done(err);
      });
    });
  });
});
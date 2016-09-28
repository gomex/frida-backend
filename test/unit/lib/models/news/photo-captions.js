/*eslint no-undef: "off"*/

var photoCaption = require('../../../../../lib/models/news/photo-captions');
var News = require('../../../../../lib/models/news');
var factory = require('../../../../factories/photo-caption-attributes').photoCaption;

describe('photoCaption', () => {
  describe('.getList', () => {
    var subject = (callback) => photoCaption.getList(callback);

    var criteria = {
      'metadata.layout': 'photo_caption',
      status: 'published'
    };
    var expectedNews = [];

    beforeEach(() => {
      sandbox.stub(News, 'find').yields(null, expectedNews);
    });

    it('searches news', (done) => {
      subject((err) => {
        expect(News.find).to.have.been.calledWith(criteria);

        done(err);
      });
    });

    it('returns news', (done) => {
      subject((err, news) => {
        expect(news).to.equal(expectedNews);

        done(err);
      });
    });
  });

  describe('.getRelateds', () => {
    var subject = (callback) => photoCaption.getRelateds(news, callback);

    given('query', () => ({
      'metadata.layout': 'photo_caption',
      status: 'published'
    }));

    given('options', () => ({
      limit: 3,
      sort: '-created_at'
    }));

    given('news', () => new News(factory.build()));

    given('newsList', () => (['foo', 'bar']));
    given('expectedList', () => newsList);

    beforeEach(() => {
      sandbox.stub(News, 'find').yields(null, newsList);
    });

    it('exists', () => {
      expect(photoCaption.getRelateds).to.exist;
    });

    it('find news', (done) => {
      subject((err) => {
        expect(News.find).to.have.been.calledWith(query, null, options);

        done(err);
      });
    });

    it('returns list', (done) => {
      subject((err, list) => {
        expect(list).to.deep.equal(expectedList);

        done(err);
      });
    });

    describe('when news is one of related news', () => {
      given('otherNews1', () => new News(factory.build()));
      given('otherNews2', () => new News(factory.build()));

      given('newsList', () => ([news, otherNews1, otherNews2]));
      given('expectedList', () => ([otherNews1, otherNews2]));

      beforeEach(() => {
        News.find.restore();
        sandbox.stub(News, 'find').yields(null, newsList);
      });

      it('excludes news from relateds', (done) => {
        subject((err, list) => {
          expect(list).to.deep.equal(expectedList);

          done(err);
        });
      });
    });
  });
});

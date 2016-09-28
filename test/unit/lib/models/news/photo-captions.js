/*eslint no-undef: "off"*/

var photoCaptions = require('../../../../../lib/models/news/photo-captions');
var News = require('../../../../../lib/models/news');
var factory = require('../../../../factories/photo-caption-attributes').photoCaption;

describe('photoCaptions', () => {
  describe('.getList', () => {
    var subject = (callback) => photoCaptions.getList(callback);

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
    var subject = (callback) => photoCaptions.getRelateds(news, callback);

    given('query', () => ({
      'metadata.layout': 'photo_caption',
      status: 'published',
      _id: {
        $ne: news._id
      }
    }));

    given('options', () => ({
      limit: 3,
      sort: '-created_at'
    }));

    given('news', () => new News(factory.build()));
    given('newsList', () => (['foo', 'bar']));

    beforeEach(() => {
      sandbox.stub(News, 'find').yields(null, newsList);
    });

    it('exists', () => {
      expect(photoCaptions.getRelateds).to.exist;
    });

    it('find news', (done) => {
      subject((err) => {
        expect(News.find).to.have.been.calledWith(query, null, options);

        done(err);
      });
    });

    it('returns list', (done) => {
      subject((err, list) => {
        expect(list).to.deep.equal(newsList);

        done(err);
      });
    });
  });
});

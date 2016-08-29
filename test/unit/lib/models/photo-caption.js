var photoCaption = require('../../../../lib/models/photo-caption');
var News = require('../../../../lib/models/news');
var factory = require('../../../factories/photo-caption-attributes').photoCaption;


describe('photoCaption', () => {
  describe('.findNews', () => {
    var subject = (callback) => photoCaption.findNews(aPhotoCaption, callback);

    var aPhotoCaption = factory.build();
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

  describe('.findPhotoCaption', () => {
    var subject = (callback) => photoCaption.findPhotoCaption(aNews, callback);

    var aNews = factory.build();
    var criteria = {
      'metadata.layout': 'photo_caption',
      status: 'published'
    };

    var expectedPhotoCaption = {};

    beforeEach(() => {
      sandbox.stub(News, 'find').yields(null, [expectedPhotoCaption]);
    });

    it('searches news', (done) => {
      subject((err) => {
        expect(News.find).to.have.been.calledWith(criteria, null, {limit: 1});

        done(err);
      });
    });

    it('returns news', (done) => {
      subject((err, aPhotoCaption) => {
        expect(aPhotoCaption).to.equal(expectedPhotoCaption);

        done(err);
      });
    });
  });
});

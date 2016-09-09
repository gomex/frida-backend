var photoCaption = require('../../../../lib/models/photo-caption');
var News = require('../../../../lib/models/news');

describe('photoCaption', () => {
  describe('.find', () => {
    var subject = (callback) => photoCaption.find(callback);

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
});

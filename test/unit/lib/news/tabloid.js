var tabloid = require('../../../../lib/news/tabloid');
var repository = require('../../../../lib/news/news-repository');

describe('tabloid', () => {
  var subject = (callback) => tabloid.findNews(aTabloid, callback);

  var aTabloid = { _id: '123' };
  var criteria = {
    '_id': aTabloid._id
  };
  var expectedNews = [];

  beforeEach(() => {
    sandbox.stub(repository, 'find').yields(null, expectedNews);
  });

  it('searches news', (done) => {
    subject((err) => {
      expect(repository.find).to.have.been.calledWith(
        criteria
      );

      done(err);
    });
  });

  it('returns news', (done) => {
    subject((err, news) => {
      expect(news).to.equal(news);

      done(err);
    });
  });
});

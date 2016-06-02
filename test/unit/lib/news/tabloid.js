var tabloid = require('../../../../lib/news/tabloid');
var repository = require('../../../../lib/news/news-repository');
var factory = require('../../../factories/tabloid-attributes').tabloidAttributes;

describe('tabloid', () => {
  var subject = (callback) => tabloid.findNews(aTabloid, callback);

  var aTabloid = factory.build();
  var criteria = {
    'edition': aTabloid.edition
  };
  var expectedNews = [];

  beforeEach(() => {
    sandbox.stub(repository, 'find').yields(null, expectedNews);
  });

  it('searches news', (done) => {
    subject((err) => {
      expect(repository.find).to.have.been.calledWith(criteria);

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

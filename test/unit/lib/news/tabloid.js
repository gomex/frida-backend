var tabloid = require('../../../../lib/news/tabloids');
var repository = require('../../../../lib/news/news-repository');
var factory = require('../../../factories/tabloid-attributes').tabloid;

describe('tabloid', () => {
  var subject = (callback) => tabloid.findNews(aTabloid, callback);

  var aTabloid = factory.build();
  var criteria = {
    'layout': 'tabloid_news',
    'edition': aTabloid.edition
  };
  var expectedNews = [];

  beforeEach(() => {
    sandbox.stub(repository, 'getAll').yields(null, expectedNews);
  });

  it('searches news', (done) => {
    subject((err) => {
      expect(repository.getAll).to.have.been.calledWith(criteria);

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

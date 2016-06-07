var tabloid = require('../../../../lib/news/tabloids');
var repository = require('../../../../lib/news/news-repository');
var factory = require('../../../factories/tabloid-attributes').tabloid;
var tabloidNewsFactory = require('../../../factories/tabloid-news-attributes').tabloid;


describe('tabloid', () => {
  describe('.findNews', () => {
    var subject = (callback) => tabloid.findNews(aTabloid, callback);

    var aTabloid = factory.build();
    var criteria = {
      'metadata.layout': 'tabloid_news',
      status: 'published',
      region: aTabloid.metadata.display_area,
      edition: aTabloid.edition
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
        expect(news).to.equal(expectedNews);

        done(err);
      });
    });
  });

  describe('.findTabloid', () => {
    var subject = (callback) => tabloid.findTabloid(aNews, callback);

    var aNews = tabloidNewsFactory.build();
    var criteria = {
      'metadata.layout': 'tabloid',
      status: 'published',
      'metadata.display_area': aNews.region,
      edition: aNews.edition
    };

    var expectedTabloid = {};

    beforeEach(() => {
      sandbox.stub(repository, 'find').yields(null, [expectedTabloid]);
    });

    it('searches news', (done) => {
      subject((err) => {
        expect(repository.find).to.have.been.calledWith(criteria, null, 1);

        done(err);
      });
    });

    it('returns news', (done) => {
      subject((err, aTabloid) => {
        expect(aTabloid).to.equal(expectedTabloid);

        done(err);
      });
    });
  });
});

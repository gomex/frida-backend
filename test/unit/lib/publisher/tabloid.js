/*eslint no-undef: "off"*/

var publisherTabloid = require('../../../../lib/publisher/tabloid');
var publisherNews = require('../../../../lib/publisher/news');
var factory = require('../../../factories/tabloid-attributes').tabloid;
var tabloidNewsFactory = require('../../../factories/tabloid-news-attributes').tabloid;

describe('tabloid', () => {
  describe('.getDataFile', () => {
    subj('getDataFile', () => publisherTabloid.getDataFile(tabloid));

    given('tabloid', () => factory.build());
    given('expectedData', () => ({areas: [], foo: 'bar'}));

    before(() => {
      sandbox.stub(publisherNews, 'getData', () => (expectedData));
    });

    it('exists', () => {
      expect(publisherTabloid.getDataFile).to.exist;
    });

    it('returns data', () => {
      expect(getDataFile).to.eql(expectedData);
    });

    describe('with news', () => {
      given('tabloid', () => factory.build({news: newsList}));

      given('news1', () => tabloidNewsFactory.build({regional_area: 'foo'}));
      given('news2', () => tabloidNewsFactory.build({regional_area: 'bar'}));
      given('news3', () => tabloidNewsFactory.build({regional_area: 'foo'}));

      given('newsData1', () => ({foo1: 'bar1'}));
      given('newsData2', () => ({foo2: 'bar2'}));
      given('newsData3', () => ({foo3: 'bar3'}));

      given('newsList', () => ([news1, news2, news3]));

      before(() => {
        publisherNews.getData.restore();
        sandbox.stub(publisherNews, 'getData', function(news) {
          var obj = {};
          obj[news1.metadata.title] = newsData1;
          obj[news2.metadata.title] = newsData2;
          obj[news3.metadata.title] = newsData3;

          return obj[news.metadata.title];
        });
      });

      it('generates areas', () => {
        expect(getDataFile.areas[0].name).to.eql('foo');
        expect(getDataFile.areas[1].name).to.eql('bar');
      });

      it('generates news', () => {
        expect(getDataFile.areas[0].news).to.eql([newsData1, newsData3]);
        expect(getDataFile.areas[1].news).to.eql([newsData2]);
      });

      it('delegates data news', () => {
        expect(publisherNews.getData).to.have.been.called;
      });
    });
  });
});

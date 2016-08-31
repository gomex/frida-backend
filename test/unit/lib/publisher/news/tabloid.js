/*eslint no-undef: "off"*/

var publisherTabloid = require('../../../../../lib/publisher/news/tabloid');
var publisherNews = require('../../../../../lib/publisher/news');
var factory = require('../../../../factories/tabloid-attributes').tabloid;
var tabloidNewsFactory = require('../../../../factories/tabloid-news-attributes').tabloid;

describe('tabloid', () => {
  describe('.getData', () => {
    subj('getData', () => publisherTabloid.getData(tabloid));

    given('tabloid', () => factory.build());
    given('expectedData', () => ({areas: [], foo: 'bar'}));

    beforeEach(() => {
      sandbox.stub(publisherNews, 'getData', () => (expectedData));
    });

    it('exists', () => {
      expect(publisherTabloid.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    describe('with news', () => {
      given('expectedData', () => ({areas: [], news: []}));

      it('removes', () => {
        expect(getData.news).to.not.exist;
      });
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

      beforeEach(() => {
        publisherNews.getData.restore();

        var stub = sandbox.stub(publisherNews, 'getData');
        stub.withArgs(news1).returns(newsData1);
        stub.withArgs(news2).returns(newsData2);
        stub.withArgs(news3).returns(newsData3);
      });

      it('generates areas', () => {
        expect(getData.areas[0].name).to.eql('foo');
        expect(getData.areas[1].name).to.eql('bar');
      });

      it('generates news', () => {
        expect(getData.areas[0].news).to.eql([newsData3, newsData1]);
        expect(getData.areas[1].news).to.eql([newsData2]);
      });

      it('delegates data news', () => {
        getData;
        expect(publisherNews.getData).to.have.been.called;
      });
    });
  });
});

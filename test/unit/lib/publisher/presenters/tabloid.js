/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/tabloid');
var postPresenter = require('../../../../../lib/publisher/presenters/post');
var factory = require('../../../../factories/tabloid-attributes').tabloid;
var metadataFactory = require('../../../../factories/tabloid-attributes').metadata;
var tabloidNewsFactory = require('../../../../factories/tabloid-news-attributes').tabloid;

describe('lib/publisher/presenters/tabloid.js', () => {
  describe('.getData', () => {
    subj('getData', () => presenter.getData(tabloid));

    given('metadata', () => metadataFactory.build({
      url: 'some_url'
    }));
    given('tabloid', () => factory.build({
      metadata: metadata,
      published_at: new Date(),
      news: []
    }));

    given('expectedData', () => ({
      title: tabloid.metadata.title,
      layout: tabloid.metadata.layout,
      display_area: tabloid.metadata.display_area,
      url: tabloid.metadata.url,
      cover: tabloid.metadata.cover,
      date: tabloid.published_at,
      published_at: tabloid.published_at,
      issuu: tabloid.issuu,
      edition: tabloid.edition,
      areas: []
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
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
        var stub = sandbox.stub(postPresenter, 'getListData');
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

      it('calls getListData to items', () => {
        getData;
        expect(postPresenter.getListData).to.have.been.calledWith(news1);
        expect(postPresenter.getListData).to.have.been.calledWith(news2);
        expect(postPresenter.getListData).to.have.been.calledWith(news3);
      });
    });
  });
});

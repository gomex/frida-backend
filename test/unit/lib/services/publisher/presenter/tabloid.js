/*eslint no-undef: "off"*/

var presenter = require('lib/services/publisher/presenter/tabloid');
var postPresenter = require('lib/services/publisher/presenter/post');
var coverPresenter = require('lib/services/publisher/presenter/cover');
var optionsPresenter = require('lib/services/publisher/presenter/options');
var factory = require('test/factories/tabloid-attributes').tabloid;
var metadataFactory = require('test/factories/tabloid-attributes').metadata;
var tabloidNewsFactory = require('test/factories/tabloid-news-attributes').tabloid;

describe('lib/services/publisher/presenter/tabloid.js', () => {
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
      path: tabloid.metadata.url,
      cover: tabloid.metadata.cover,
      date: tabloid.published_at,
      published_at: tabloid.published_at,
      issuu: tabloid.issuu,
      edition: tabloid.edition,
      areas: []
    }));

    beforeEach(() => {
      sandbox.stub(coverPresenter, 'getData');
    });

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getData;
      expect(coverPresenter.getData).to.have.been.calledWith(tabloid);
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

  describe('.getListData', () => {
    subj('getListData', () => presenter.getListData(tabloid, options));

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
      display_area: tabloid.metadata.display_area,
      url: tabloid.metadata.url,
      path: tabloid.metadata.url
    }));

    given('options', () => ({ some: 'options' }));

    beforeEach(() => {
      sandbox.spy(optionsPresenter, 'getData');
    });

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });

    it('calls options presenter', () => {
      getListData;
      expect(optionsPresenter.getData).to.have.been.calledWith(tabloid, options);
    });
  });
});

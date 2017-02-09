/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/tabloid-news');
var coverPresenter = require('../../../../../lib/publisher/presenters/cover');
var factory = require('../../../../factories/tabloid-news-attributes').tabloid;
var metadataFactory = require('../../../../factories/tabloid-news-attributes').metadata;

describe('lib/publisher/presenters/tabloidNews.js', () => {
  given('metadata', () => metadataFactory.build({
    url: 'some_url'
  }));
  given('tabloidNews', () => factory.build({
    metadata: metadata,
    url: 'some_url',
    issuu: 'some_issuu_url',
    edition: 'some_edition',
    published_at: new Date()
  }));

  beforeEach(() => {
    sandbox.spy(coverPresenter, 'getData');
  });

  describe('getData', () => {
    subj('getData', () => presenter.getData(tabloidNews));

    given('expectedData', () => ({
      layout: tabloidNews.metadata.layout,
      area: tabloidNews.metadata.area,
      url: tabloidNews.metadata.url,
      path: tabloidNews.metadata.url,
      hat: tabloidNews.metadata.hat,
      title: tabloidNews.metadata.title,
      description: tabloidNews.metadata.description,
      author: tabloidNews.metadata.author,
      editor: tabloidNews.metadata.editor,
      place: tabloidNews.metadata.place,
      region: tabloidNews.region,
      issuu: tabloidNews.issuu,
      edition: tabloidNews.edition,
      labels: tabloidNews.tags,
      date: tabloidNews.published_at,
      published_at: tabloidNews.published_at,
      cover: tabloidNews.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getData;
      expect(coverPresenter.getData).to.have.been.calledWith(tabloidNews);
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(tabloidNews));

    given('expectedData', () => ({
      title: tabloidNews.metadata.title,
      area: tabloidNews.metadata.area,
      hat: tabloidNews.metadata.hat,
      description: tabloidNews.metadata.description,
      url: tabloidNews.metadata.url,
      path: tabloidNews.metadata.url,
      date: tabloidNews.published_at,
      published_at: tabloidNews.published_at,
      cover: tabloidNews.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getListData;
      expect(coverPresenter.getData).to.have.been.calledWith(tabloidNews);
    });
  });
});

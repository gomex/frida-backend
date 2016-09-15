/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/column');
var coverPresenter = require('../../../../../lib/publisher/presenters/cover');
var factory = require('../../../../factories/column-attributes').column;
var metadataFactory = require('../../../../factories/column-attributes').metadata;

describe('lib/publisher/presenters/column.js', () => {
  given('metadata', () => metadataFactory.build({
    url: 'some_url'
  }));
  given('column', () => factory.build({
    metadata: metadata,
    url: 'some_url',
    published_at: new Date()
  }));

  beforeEach(() => {
    sandbox.spy(coverPresenter, 'getData');
  });

  describe('getData', () => {
    subj('getData', () => presenter.getData(column));

    given('expectedData', () => ({
      layout: column.metadata.layout,
      display_area: column.metadata.display_area,
      url: column.metadata.url,
      hat: column.metadata.hat,
      title: column.metadata.title,
      description: column.metadata.description,
      place: column.metadata.place,
      date: column.published_at,
      columnist: column.metadata.columnist,
      published_at: column.published_at,
      cover: column.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getData;
      expect(coverPresenter.getData).to.have.been.calledWith(column);
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(column));

    given('expectedData', () => ({
      title: column.metadata.title,
      hat: column.metadata.hat,
      description: column.metadata.description,
      url: column.metadata.url,
      date: column.published_at,
      columnist: column.metadata.columnist,
      published_at: column.published_at,
      cover: column.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getListData;
      expect(coverPresenter.getData).to.have.been.calledWith(column);
    });
  });
});

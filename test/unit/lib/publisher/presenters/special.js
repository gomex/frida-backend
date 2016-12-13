/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/special');
var coverPresenter = require('../../../../../lib/publisher/presenters/cover');
var factory = require('../../../../factories/special-attributes').special;
var metadataFactory = require('../../../../factories/special-attributes').metadata;

describe('lib/publisher/presenters/special.js', () => {
  given('metadata', () => metadataFactory.build({
    url: 'some_url'
  }));
  given('special', () => factory.build({
    metadata: metadata,
    published_at: new Date()
  }));

  beforeEach(() => {
    sandbox.spy(coverPresenter, 'getData');
  });

  describe('getData', () => {
    subj('getData', () => presenter.getData(special));

    given('expectedData', () => ({
      layout: special.metadata.layout,
      path: special.metadata.url,
      url: special.metadata.url,
      title: special.metadata.title,
      description: special.metadata.description,
      published_at: special.published_at,
      cover: special.metadata.cover,
      labels: special.tags,
      sections: special.sections
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getData;
      expect(coverPresenter.getData).to.have.been.calledWith(special);
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(special));

    given('expectedData', () => ({
      path: special.metadata.url,
      title: special.metadata.title,
      published_at: special.published_at,
      cover: special.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getListData;
      expect(coverPresenter.getData).to.have.been.calledWith(special);
    });
  });
});

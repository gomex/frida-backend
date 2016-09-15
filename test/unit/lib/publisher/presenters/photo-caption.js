/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/photo-caption');
var coverPresenter = require('../../../../../lib/publisher/presenters/cover');
var factory = require('../../../../factories/photo-caption-attributes').photoCaption;

describe('lib/publisher/presenters/photoCaption.js', () => {
  given('photoCaption', () => factory.build({
    published_at: new Date()
  }));

  beforeEach(() => {
    sandbox.spy(coverPresenter, 'getData');
  });

  describe('getData', () => {
    subj('getData', () => presenter.getData(photoCaption));

    given('expectedData', () => ({
      layout: photoCaption.metadata.layout,
      title: photoCaption.metadata.title,
      cover: photoCaption.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getData;
      expect(coverPresenter.getData).to.have.been.calledWith(photoCaption);
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(photoCaption));

    given('expectedData', () => ({
      title: photoCaption.metadata.title,
      cover: photoCaption.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getListData;
      expect(coverPresenter.getData).to.have.been.calledWith(photoCaption);
    });
  });
});

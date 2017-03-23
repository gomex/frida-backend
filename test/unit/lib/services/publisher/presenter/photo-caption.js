/*eslint no-undef: "off"*/

var presenter = require('lib/services/publisher/presenter/photo-caption');
var coverPresenter = require('lib/services/publisher/presenter/cover');
var optionsPresenter = require('lib/services/publisher/presenter/options');
var factory = require('test/factories/photo-caption-attributes').photoCaption;

describe('lib/services/publisher/presenter/photoCaption.js', () => {
  given('photoCaption', () => factory.build({
    published_at: new Date(),
    related_photo_captions: []
  }));

  beforeEach(() => {
    sandbox.spy(coverPresenter, 'getData');
  });

  describe('getData', () => {
    subj('getData', () => presenter.getData(photoCaption));

    given('expectedData', () => ({
      layout: photoCaption.metadata.layout,
      url: photoCaption.metadata.url,
      path: photoCaption.metadata.url,
      title: photoCaption.metadata.title,
      cover: photoCaption.metadata.cover,
      related_photo_captions: []
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

    describe('related_photo_captions', () => {
      given('photoCaption', () => factory.build({
        published_at: new Date(),
        related_photo_captions: factory.buildList(2)
      }));

      given('data', () => ({foo: 'bar'}));

      beforeEach(() => {
        sandbox.stub(presenter, 'getListData').returns(data);
      });

      it('sets data', () => {
        expect(getData.related_photo_captions).to.eql([data, data]);
      });
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(photoCaption, options));

    given('expectedData', () => ({
      title: photoCaption.metadata.title,
      url: photoCaption.metadata.url,
      path: photoCaption.metadata.url,
      cover: photoCaption.metadata.cover
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

    it('calls cover presenter', () => {
      getListData;
      expect(coverPresenter.getData).to.have.been.calledWith(photoCaption);
    });

    it('calls options presenter', () => {
      getListData;
      expect(optionsPresenter.getData).to.have.been.calledWith(photoCaption, options);
    });
  });
});

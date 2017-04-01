/*eslint no-undef: "off"*/

var presenter = require('lib/services/publisher/presenter/special');
var coverPresenter = require('lib/services/publisher/presenter/cover');
var textPresenter = require('lib/services/publisher/presenter/special/text');
var factory = require('test/factories/special-attributes').special;
var metadataFactory = require('test/factories/special-attributes').metadata;

describe('lib/services/publisher/presenter/special.js', () => {
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
      hat: 'especial',
      url: special.metadata.url,
      title: special.metadata.title,
      description: special.metadata.description,
      published_at: special.published_at,
      cover: special.metadata.cover,
      labels: special.tags,
      sections: []
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

    context('when there is sections', () => {
      given('section', () => ({
        type: 'some'
      }));

      beforeEach(() => {
        special.sections = [section];
      });

      it('sets section', () => {
        expect(getData.sections).to.deep.equal([section]);
      });

      context('when is type text', () => {
        given('section', () => ({
          type: 'text',
          text: 'some text'
        }));

        beforeEach(() => {
          special.sections = [section];
          sandbox.spy(textPresenter, 'getData');
        });

        it('delegates to text presenter', () => {
          getData;
          expect(textPresenter.getData).to.have.been.called;
        });
      });
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(special));

    given('expectedData', () => ({
      layout: special.metadata.layout,
      path: special.metadata.url,
      hat: 'especial',
      url: special.metadata.url,
      author: 'Redação Brasil de Fato',
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

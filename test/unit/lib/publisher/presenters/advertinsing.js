/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/advertising');
var factory = require('../../../../factories/advertising-attributes').advertising;

describe('lib/publisher/presenters/advertising.js', () => {
  describe('.getData', () => {
    subj('getData', () => presenter.getData(advertising));

    given('advertising', () => factory.build());

    given('expectedData', () => ({
      title: advertising.metadata.title,
      layout: advertising.metadata.layout,
      link: advertising.link,
      image: advertising.image
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });
  });
});

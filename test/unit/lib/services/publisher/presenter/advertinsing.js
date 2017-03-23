/*eslint no-undef: "off"*/

var presenter = require('lib/services/publisher/presenter/advertising');
var factory = require('test/factories/advertising-attributes').advertising;

describe('lib/services/publisher/presenter/advertising.js', () => {
  describe('.getData', () => {
    subj('getData', () => presenter.getData(advertising));

    given('advertising', () => factory.build());

    given('expectedData', () => ({
      title: advertising.metadata.title,
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

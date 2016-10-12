/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/spotlight');
var factory = require('../../../../factories/spotlight-attributes').spotlight;

describe('lib/publisher/presenters/spotlight.js', () => {
  describe('.getData', () => {
    subj('getData', () => presenter.getData(spotlight));

    given('spotlight', () => factory.build());

    given('expectedData', () => ({
      title: spotlight.metadata.title,
      link: spotlight.link,
      image: spotlight.image
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });
  });
});

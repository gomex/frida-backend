/*eslint no-undef: "off"*/

var presenter = require('lib/services/publisher/presenter/spotlight');
var factory = require('test/factories/spotlight-attributes').spotlight;

describe('lib/services/publisher/presenter/spotlight.js', () => {
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

  describe('.getListData', () => {
    subj('getListData', () => presenter.getListData(spotlight));

    given('spotlight', () => factory.build());

    given('expectedData', () => ({
      title: spotlight.metadata.title,
      link: spotlight.link,
      image: spotlight.image
    }));

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });
  });
});

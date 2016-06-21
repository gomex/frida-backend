/*eslint no-undef: "off"*/

var News = require('../../../../lib/models/news');
var tabloidFactory = require('../../../factories/tabloid-attributes').tabloid;
var newsFactory = require('../../../factories/news-attributes').news;

describe('tabloid', () => {
  describe('#isTabloid', () => {
    subj('isTabloid', () => tabloid.isTabloid());

    given('tabloid', () => new News(tabloidFactory.build()));

    it('is true', () => {
      expect(isTabloid).to.be.true;
    });

    describe('when is not', () => {
      given('tabloid', () => new News(newsFactory.build()));

      it('is false', () => {
        expect(isTabloid).to.be.false;
      });
    });
  });
});

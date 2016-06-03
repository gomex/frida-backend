/*eslint no-undef: "off"*/

var publisherTabloid = require('../../../../lib/publisher/tabloid');
var factory = require('../../../factories/tabloid-attributes').tabloidAttributes;
var tabloidNewsFactory = require('../../../factories/tabloid-news-attributes').attributes;

describe('tabloid', () => {
  describe('.getDataFile', () => {
    subj('getDataFile', () => publisherTabloid.getDataFile(tabloid));

    given('tabloid', () => factory.build());
    given('expectedData', () => ({
      issuu: tabloid.issuu,
      areas: []
    }));

    it('exists', () => {
      expect(publisherTabloid.getDataFile).to.exist;
    });

    it('returns data', () => {
      expect(getDataFile).to.eql(expectedData);
    });

    describe('with news', () => {
      subj('area', () => getDataFile.areas[0]);

      given('tabloid', () => factory.build({regional_area: 'regional_area', news: newsList}));
      given('newsList', () => ([news]));
      given('news', () => tabloidNewsFactory.build({regional_area: 'regional_area'}));
      given('expectedNews', () => newsList[0]);

      it('generates areas', () => {
        expect(area.name).to.eql(tabloid.regional_area);
      });

      it('generates news', () => {
        expect(news).to.eql(expectedNews);
      });

      describe('when has multiple regionals', () => {
        given('news1', () => tabloidNewsFactory.build({regional_area: 'foo'}));
        given('news2', () => tabloidNewsFactory.build({regional_area: 'bar'}));
        given('news3', () => tabloidNewsFactory.build({regional_area: 'foo'}));

        given('newsList', () => ([news1, news2, news3]));

        it('generates areas', () => {
          expect(getDataFile.areas[0].name).to.eql('foo');
          expect(getDataFile.areas[1].name).to.eql('bar');
        });

        it('generates news', () => {
          expect(getDataFile.areas[0].news).to.eql([news1, news3]);
          expect(getDataFile.areas[1].news).to.eql([news2]);
        });
      });
    });
  });
});

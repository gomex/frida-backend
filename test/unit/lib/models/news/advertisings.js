/*eslint no-undef: "off"*/

var News = require('lib/models/news');
var advertisings = require('lib/models/news/advertisings');
var factory = require('test/factories/advertising-attributes').advertising;

describe('lib/models/news/t.js', () => {
  describe('.getList', () => {
    var subject = (callback) => advertisings.getList(callback);

    given('criteria', () => ({
      'metadata.layout': 'advertising',
      status: 'published'
    }));

    given('advertising', () => factory.build());

    beforeEach(() => {
      sandbox.stub(News, 'find').yields(null, [advertising]);
    });

    it('exists', () => {
      expect(advertisings.getList).to.exist;
    });

    it('searchs t', (done) => {
      subject((err) => {
        expect(News.find).to.have.been.calledWith(Object.assign(
          criteria, {'metadata.display_area': 'advertising_01'}
        ));

        expect(News.find).to.have.been.calledWith(Object.assign(
          criteria, {'metadata.display_area': 'advertising_02'}
        ));

        expect(News.find).to.have.been.calledWith(Object.assign(
          criteria, {'metadata.display_area': 'advertising_03'}
        ));

        expect(News.find).to.have.been.calledWith(Object.assign(
          criteria, {'metadata.display_area': 'advertising_04'}
        ));

        expect(News.find).to.have.been.calledWith(Object.assign(
          criteria, {'metadata.display_area': 'advertising_05'}
        ));

        expect(News.find).to.have.been.calledWith(Object.assign(
          criteria, {'metadata.display_area': 'advertising_06'}
        ));

        done(err);
      });
    });

    it('returns list', () => {
      subject((err, list) => {
        expect(list).to.eql([
          advertising,
          advertising,
          advertising,
          advertising,
          advertising,
          advertising
        ]);
      });
    });
  });
});

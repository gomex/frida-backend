/*eslint no-undef: "off"*/

var News = require('../../../../lib/models/news');
var presenter = require('../../../../lib/publisher/presenter');
var postPresenter = require('../../../../lib/publisher/presenters/post');
var postFactoty = require('../../../factories/post-attributes').post;
var tabloidFactory = require ('../../../factories/tabloid-attributes').tabloid;
var tabloidPresenter = require('../../../../lib/publisher/presenters/tabloid');
var columnFactory = require ('../../../factories/column-attributes').column;
var columnPresenter = require('../../../../lib/publisher/presenters/column');
var tabloidNewsFactory = require ('../../../factories/tabloid-news-attributes').tabloid;
var tabloidNewsPresenter = require('../../../../lib/publisher/presenters/tabloid-news');
var photoCaptionFactory = require ('../../../factories/photo-caption-attributes').photoCaption;
var photoCaptionPresenter = require('../../../../lib/publisher/presenters/photo-caption');
var advertisingFactory = require ('../../../factories/advertising-attributes').advertising;
var advertisingPresenter = require('../../../../lib/publisher/presenters/advertising');

describe('lib/publisher/presenter.js', () => {
  describe('of', () => {
    subj('of', () => presenter.of(news));

    it('exists', () => {
      expect(presenter.of).to.exist;
    });

    describe('when is post', () => {
      given('news', () => new News(postFactoty.build()));

      it('returns post presenter', () => {
        expect(of).to.equals(postPresenter);
      });
    });

    describe('when is tabloid', () => {
      given('news', () => new News(tabloidFactory.build()));

      it('returns tabloid presenter', () => {
        expect(of).to.equals(tabloidPresenter);
      });
    });

    describe('when is tabloidNews', () => {
      given('news', () => new News(tabloidNewsFactory.build()));

      it('returns tabloidNews presenter', () => {
        expect(of).to.equals(tabloidNewsPresenter);
      });
    });

    describe('when is column', () => {
      given('news', () => new News(columnFactory.build()));

      it('returns column presenter', () => {
        expect(of).to.equals(columnPresenter);
      });
    });

    describe('when is advertising', () => {
      given('news', () => new News(advertisingFactory.build()));

      it('returns advertising presenter', () => {
        expect(of).to.equals(advertisingPresenter);
      });
    });

    describe('when is photo caption', () => {
      given('news', () => new News(photoCaptionFactory.build()));

      it('returns advertising presenter', () => {
        expect(of).to.equals(photoCaptionPresenter);
      });
    });

    describe('when has other layout', () => {
      given('news', () => new News(postFactoty.build({
        metadata: { layout: 'other_layout' }
      })));

      it('throws error', () => {
        expect(() => of).to.throw(Error);
      });
    });
  });
});
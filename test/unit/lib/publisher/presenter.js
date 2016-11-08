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
var spotlightFactory = require ('../../../factories/spotlight-attributes').spotlight;
var spotlightPresenter = require('../../../../lib/publisher/presenters/spotlight');

describe('lib/publisher/presenter.js', () => {
  describe('of', () => {
    it('exists', () => {
      expect(presenter.of).to.exist;
    });

    subj('of', () => presenter.of(news));

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

    describe('when is spotlight', () => {
      given('news', () => new News(spotlightFactory.build()));

      it('returns advertising presenter', () => {
        expect(of).to.equals(spotlightPresenter);
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

  describe('getListData', () => {
    subj('of', () => presenter.getListData(post));
    given('post', () => new News(postFactoty.build()));

    beforeEach(() => {
      sandbox.spy(presenter, 'of');
      sandbox.spy(postPresenter, 'getListData');
    });

    it('selects presenter', () => {
      of;
      expect(presenter.of).to.have.been.calledWith(post);
    });

    it('gets list data', () => {
      of;
      expect(postPresenter.getListData).to.have.been.calledWith(post);
    });
  });
});

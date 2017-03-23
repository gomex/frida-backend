/*eslint no-undef: "off"*/

var News = require('lib/models/news');
var presenter = require('lib/services/publisher/presenter');
var postPresenter = require('lib/services/publisher/presenter/post');
var postFactoty = require('test/factories/post-attributes').post;
var tabloidFactory = require ('test/factories/tabloid-attributes').tabloid;
var tabloidPresenter = require('lib/services/publisher/presenter/tabloid');
var columnFactory = require ('test/factories/column-attributes').column;
var columnPresenter = require('lib/services/publisher/presenter/column');
var tabloidNewsFactory = require ('test/factories/tabloid-news-attributes').tabloid;
var tabloidNewsPresenter = require('lib/services/publisher/presenter/tabloid-news');
var photoCaptionFactory = require ('test/factories/photo-caption-attributes').photoCaption;
var photoCaptionPresenter = require('lib/services/publisher/presenter/photo-caption');
var advertisingFactory = require ('test/factories/advertising-attributes').advertising;
var advertisingPresenter = require('lib/services/publisher/presenter/advertising');
var spotlightFactory = require ('test/factories/spotlight-attributes').spotlight;
var spotlightPresenter = require('lib/services/publisher/presenter/spotlight');
var specialFactory = require ('test/factories/special-attributes').special;
var specialPresenter = require('lib/services/publisher/presenter/special');

describe('lib/services/publisher/presenter.js', () => {
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

    describe('when is special', () => {
      given('news', () => new News(specialFactory.build()));

      it('returns special presenter', () => {
        expect(of).to.equals(specialPresenter);
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
    subj('of', () => presenter.getListData(post, options));
    given('post', () => new News(postFactoty.build()));
    given('options', () => ({some: 'options'}));

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
      expect(postPresenter.getListData).to.have.been.calledWith(post, options);
    });
  });
});

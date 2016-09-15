/*eslint no-undef: "off"*/

var News = require('../../../../lib/models/news');
var presenter = require('../../../../lib/publisher/presenter');
var postPresenter = require('../../../../lib/publisher/presenters/post');
var postFactoty = require('../../../factories/post-attributes').post;
var tabloidFactory = require ('../../../factories/tabloid-attributes').tabloid;
var tabloidPresenter = require('../../../../lib/publisher/presenters/tabloid');
var columnFactory = require ('../../../factories/column-attributes').column;
var columnPresenter = require('../../../../lib/publisher/presenters/column');

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

    describe('when is column', () => {
      given('news', () => new News(columnFactory.build()));

      it('returns column presenter', () => {
        expect(of).to.equals(columnPresenter);
      });
    });
  });
});

/*eslint no-undef: "off"*/

var News = require('../../../../lib/models/news');
var presenter = require('../../../../lib/publisher/presenter');
var postPresenter = require('../../../../lib/publisher/presenters/post');
var postFactoty = require('../../../factories/post-attributes').post;
var tabloidFactory = require ('../../../factories/tabloid-attributes').tabloid;
var tabloidPresenter = require('../../../../lib/publisher/presenters/tabloid');
var columnFactory = require ('../../../factories/column-attributes').column;
var columnPresenter = require('../../../../lib/publisher/presenters/column');
var newsPublisher = require('../../../../lib/publisher/news');
var tabloidNewsFactory = require ('../../../factories/tabloid-news-attributes').tabloid;
var tabloidNewsPresenter = require('../../../../lib/publisher/presenters/tabloid-news');

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

    describe.only('when is tabloidNews', () => {
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

    describe('when has other layout', () => {
      given('news', () => new News(postFactoty.build({
        metadata: { layout: 'other_layout' }
      })));

      it('returns news presenter', () => {
        expect(of).to.equals(newsPublisher);
      });
    });
  });
});

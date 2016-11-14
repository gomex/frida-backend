/*eslint no-undef: "off"*/

var Home = require('../../../../../lib/models/home');
var News = require('../../../../../lib/models/news');
var presenter = require('../../../../../lib/publisher/presenters/bdf');
var presenters = require('../../../../../lib/publisher/presenter');
var postFactory = require('../../../../factories/post-attributes').post;
var columnFactory = require('../../../../factories/column-attributes').column;
var spotlightFactory = require('../../../../factories/spotlight-attributes').spotlight;
var tabloidFactory = require('../../../../factories/tabloid-attributes').tabloid;
var photoCaptionFactory = require('../../../../factories/photo-caption-attributes').photoCaption;

describe('lib/publisher/presenters/bdf.js', () => {
  describe('getData', () => {
    subj('getData', () => presenter.getData(home));

    given('home', () => new Home({
      name: 'bdf',
      featured_01: new News(postFactory.build()),
      featured_02: new News(postFactory.build()),
      featured_03: new News(postFactory.build()),
      featured_04: new News(postFactory.build()),
      featured_05: new News(postFactory.build()),
      featured_06: new News(postFactory.build()),
      featured_07: new News(postFactory.build()),
      featured_08: new News(postFactory.build()),

      column_01: new News(columnFactory.build()),
      column_02: new News(columnFactory.build()),
      column_03: new News(columnFactory.build()),

      photo_caption: new News(photoCaptionFactory.build()),

      spotlight_01: new News(spotlightFactory.build()),
      spotlight_02: new News(spotlightFactory.build()),
      spotlight_03: new News(spotlightFactory.build()),

      tabloid_ce: new News(tabloidFactory.build()),
      tabloid_mg: new News(tabloidFactory.build()),
      tabloid_pr: new News(tabloidFactory.build()),
      tabloid_pe: new News(tabloidFactory.build()),
      tabloid_rj: new News(tabloidFactory.build())
    }));

    function behaviorLikeAListDataField(fieldName, dataName) {
      describe(fieldName, () => {
        given('listData', () => ({foo: 'bar'}));

        beforeEach(() => {
          sandbox.stub(presenters, 'getListData').withArgs(home[fieldName]).returns(listData);
        });

        it('sets featureds', () => {
          expect(getData[dataName]).to.equal(listData);
        });
      });
    }

    it('layout is "national"', () => {
      expect(getData.layout).to.equal('national');
    });

    behaviorLikeAListDataField('featured_01', 'featured_01');
    behaviorLikeAListDataField('featured_02', 'featured_02');
    behaviorLikeAListDataField('featured_03', 'featured_03');
    behaviorLikeAListDataField('featured_04', 'featured_04');
    behaviorLikeAListDataField('featured_05', 'featured_05');
    behaviorLikeAListDataField('featured_06', 'featured_06');
    behaviorLikeAListDataField('featured_07', 'featured_07');
    behaviorLikeAListDataField('featured_08', 'featured_08');

    behaviorLikeAListDataField('column_01', 'column_01');
    behaviorLikeAListDataField('column_02', 'column_02');
    behaviorLikeAListDataField('column_03', 'column_03');

    behaviorLikeAListDataField('photo_caption', 'photo_caption');

    behaviorLikeAListDataField('tabloid_ce', 'ceara');
    behaviorLikeAListDataField('tabloid_mg', 'minas_gerais');
    behaviorLikeAListDataField('tabloid_pr', 'parana');
    behaviorLikeAListDataField('tabloid_pe', 'pernambuco');
    behaviorLikeAListDataField('tabloid_rj', 'rio_de_janeiro');

    behaviorLikeAListDataField('spotlight_01', 'spotlight_01');
    behaviorLikeAListDataField('spotlight_02', 'spotlight_02');
    behaviorLikeAListDataField('spotlight_03', 'spotlight_03');
  });
});

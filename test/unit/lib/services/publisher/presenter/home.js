/*eslint no-undef: "off"*/

var Home = require('lib/models/home');
var News = require('lib/models/news');
var presenter = require('lib/services/publisher/presenter/home');
var presenters = require('lib/services/publisher/presenter');
var postFactory = require('test/factories/post-attributes').post;

describe('lib/services/publisher/presenter/home', () => {
  describe('getData', () => {
    subj('getData', () => presenter.getData(home));

    given('home', () => new Home({
      name: 'layout',
      featured_01: featured_01
    }));
    given('featured_01', () => new News(postFactory.build()));

    beforeEach(() => {
      sandbox.stub(presenters, 'getListData').returns('featured_01');
    });

    it('sets layout', () => {
      expect(getData.layout).to.equal(home.name);
    });

    it('sets featured_01', () => {
      expect(getData.featured_01).to.equal('featured_01');
    });
  });
});

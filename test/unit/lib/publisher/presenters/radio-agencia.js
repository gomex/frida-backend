/*eslint no-undef: "off"*/

var _ = require('underscore');
var Home = require('../../../../../lib/models/home');
var News = require('../../../../../lib/models/news');
var presenter = require('../../../../../lib/publisher/presenters/radio-agencia');
var postPresenter = require('../../../../../lib/publisher/presenters/post');
var postFactory = require('../../../../factories/post-attributes').post;

describe('lib/publisher/presenters/home.js', () => {
  describe('getData', () => {
    subj('getData', () => presenter.getData(home));

    given('latest_news', () => _.map(postFactory.buildList(22), (post) => new News(post)));
    given('featured_01', () => _.first(latest_news));
    given('home', () => {
      var home = new Home({ name: 'radio_agencia', featured_01: featured_01 });
      home.latest_news = latest_news;
      return home;
    });

    it('sets layout', () => {
      expect(getData.layout).to.equal('radioagencia');
    });

    it('sets path', () => {
      expect(getData.path).to.equal('/radioagencia');
    });

    it('sets featured_01', () => {
      expect(getData.featured_01).to.eql(postPresenter.getListData(featured_01));
    });

    it('set latest_news', () => {
      expect(getData.latest_news).to.not.be.empty;
    });
  });
});

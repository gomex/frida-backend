/*eslint no-undef: "off"*/

var _ = require('underscore');
var Home = require('lib/models/home');
var News = require('lib/models/news');
var presenter = require('lib/services/publisher/presenter/radio-agencia');
var postPresenter = require('lib/services/publisher/presenter/post');
var postFactory = require('test/factories/post-attributes').post;

describe('lib/services/publisher/presenter/home.js', () => {
  describe('getData', () => {
    subj('getData', () => presenter.getData(home));

    given('latest_news', () => _.map(postFactory.buildList(20), (post) => new News(post)));
    given('featured_01', () => new News(postFactory.build()));
    given('service_01', () => new News(postFactory.build()));
    given('service_02', () => new News(postFactory.build()));
    given('service_03', () => new News(postFactory.build()));
    given('service_04', () => new News(postFactory.build()));
    given('service_05', () => new News(postFactory.build()));
    given('service_06', () => new News(postFactory.build()));
    given('service_07', () => new News(postFactory.build()));
    given('service_08', () => new News(postFactory.build()));
    given('home', () => {
      var home = new Home({
        name: 'radio_agencia',
        featured_01: featured_01,
        service_01: service_01,
        service_02: service_02,
        service_03: service_03,
        service_04: service_04,
        service_05: service_05
      });
      home.service_06 = service_06;
      home.service_07 = service_07;
      home.service_08 = service_08;
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

    it('sets service_01', () => {
      expect(getData.service_01).to.eql(postPresenter.getListData(service_01));
    });

    it('sets service_02', () => {
      expect(getData.service_02).to.eql(postPresenter.getListData(service_02));
    });

    it('sets service_03', () => {
      expect(getData.service_03).to.eql(postPresenter.getListData(service_03));
    });

    it('sets service_04', () => {
      expect(getData.service_04).to.eql(postPresenter.getListData(service_04));
    });

    it('sets service_05', () => {
      expect(getData.service_05).to.eql(postPresenter.getListData(service_05));
    });

    it('sets service_06', () => {
      expect(getData.service_06).to.eql(postPresenter.getListData(service_06));
    });

    it('sets service_07', () => {
      expect(getData.service_07).to.eql(postPresenter.getListData(service_07));
    });

    it('sets service_08', () => {
      expect(getData.service_08).to.eql(postPresenter.getListData(service_08));
    });

    it('set latest_news', () => {
      expect(getData.latest_news).to.not.be.empty;
    });
  });
});

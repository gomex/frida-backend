/*eslint no-undef: "off"*/

var rssList = require('../../../../lib/publisher/rss-list');
var postPresenter = require('../../../../lib/publisher/presenters/post');
var newsFactory = require('../../../factories/news-attributes').news;

describe('lib/models/news/rss-list.js', () => {
  describe('getData', () => {
    subj('getData', () => rssList.getData(news));

    given('news', () => newsFactory.buildList(2));

    given('newsData', () => ({foo: 'bar'}));

    beforeEach(() => {
      sandbox.stub(postPresenter, 'getRSSData').returns(newsData);
      sandbox.useFakeTimers(Date.now(), 'Date');
    });

    it('sets layout', () => {
      expect(getData.layout).to.eql('rss');
    });

    it('sets list', () => {
      expect(getData.list).to.eql([newsData, newsData]);
    });

    it('sets pubDate', () => {
      expect(getData.pubDate).to.eql(Date.now());
    });
  });
});

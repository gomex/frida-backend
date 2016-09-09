/*eslint no-undef: "off"*/

var publisherList = require('../../../../../lib/publisher/news/list');
var publisherNews = require('../../../../../lib/publisher/news');
var newsFactory = require('../../../../factories/news-attributes').news;

describe('lib/models/news/list.js', () => {
  describe('getData', () => {
    subj('getData', () => publisherList.getData(news));

    given('news', () => newsFactory.buildList(2));

    given('newsData', () => ({foo: 'bar'}));

    beforeEach(() => {
      sandbox.stub(publisherNews, 'getData').returns(newsData);
    });

    it('sets layout', () => {
      expect(getData.layout).to.eql('photo_caption_list');
    });

    it('sets news', () => {
      expect(getData.news).to.eql([newsData, newsData]);
    });

    it('sets area', () => {
      expect(getData.area).to.eql('charges');
    });
  });
});

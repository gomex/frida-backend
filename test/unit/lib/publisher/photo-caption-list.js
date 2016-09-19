/*eslint no-undef: "off"*/

var publisherList = require('../../../../lib/publisher/photo-caption-list');
var photoCaptionPresenter = require('../../../../lib/publisher/presenters/photo-caption');
var newsFactory = require('../../../factories/news-attributes').news;

describe('lib/models/news/list.js', () => {
  describe('getData', () => {
    subj('getData', () => publisherList.getData(news));

    given('news', () => newsFactory.buildList(2));

    given('newsData', () => ({foo: 'bar'}));

    beforeEach(() => {
      sandbox.stub(photoCaptionPresenter, 'getData').returns(newsData);
    });

    it('sets layout', () => {
      expect(getData.layout).to.eql('photo_caption_list');
    });

    it('sets list', () => {
      expect(getData.list).to.eql([newsData, newsData]);
    });

    it('sets area', () => {
      expect(getData.area).to.eql('charges');
    });
  });
});

/*eslint no-undef: "off"*/

var publisherNews = require('../../../../../lib/publisher/news');
var factory = require('../../../../factories/news-attributes').news;
var metadataFactory = require('../../../../factories/news-attributes').metadata;
var publisherPost = require('../../../../../lib/publisher/news/post');


describe('post', () => {
  describe('getData', () => {
    subj('getData', () => publisherPost.getData(news));

    given('metadata', () => metadataFactory.build());
    given('news', () => factory.build({
      published_at: new Date(), metadata: metadata, other_news: [otherNews]
    }));

    given('otherNews', () => factory.build());
    given('newsData', () => ({foo: 'bar'}));
    given('otherNewsData', () => ({bar: 'foo'}));

    given('expected', () => {
      return Object.assign({
        other_news: otherNewsData
      }, newsData);
    });

    beforeEach(() => {
      var stub = sandbox.stub(publisherNews, 'getData');
      stub.withArgs(news).returns(newsData);
      stub.withArgs(otherNews).returns(otherNewsData);
    });

    it('exists', () => {
      expect(publisherPost.getData).to.exist;
    });

    it('adds other news', () => {
      expect(getData.other_news).to.eql([otherNewsData]);
    });

    it('delegates to data news', () => {
      expect(getData).to.eql(expected);
    });
  });
});

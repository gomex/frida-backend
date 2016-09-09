/*eslint no-undef: "off"*/

var publisherNews = require('../../../../../lib/publisher/news');
var factory = require('../../../../factories/post-attributes').post;
var publisherPost = require('../../../../../lib/publisher/news/post');

describe('lib/publisher/news/post.js', () => {
  describe('getData', () => {
    subj('getData', () => publisherPost.getData(news));

    given('news', () => factory.build());
    given('newsData', () => ({foo: 'bar'}));

    given('expected', () => {
      return Object.assign({
        other_news: [],
        related_news: []
      }, newsData);
    });

    given('getDataStub', () => sandbox.stub(publisherNews, 'getData'));

    beforeEach(() => {
      getDataStub.withArgs(news).returns(newsData);
    });

    it('exists', () => {
      expect(publisherPost.getData).to.exist;
    });

    it('delegates to publisherNews', () => {
      expect(getData).to.eql(expected);
    });

    describe('other_news', () => {
      given('news', () => factory.build({other_news: [otherNews]}));

      given('otherNews', () => factory.build());
      given('otherNewsData', () => ({bar: 'foo'}));

      beforeEach(() => {
        getDataStub.withArgs(news).returns(newsData);
        getDataStub.withArgs(otherNews).returns(otherNewsData);
      });

      it('delegates to publisherNews', () => {
        expect(getData.other_news).to.eql([otherNewsData]);
      });
    });

    describe('related_news', () => {
      given('news', () => factory.build({related_news: [relatedNews]}));

      given('relatedNews', () => factory.build());
      given('relatedNewsData', () => ({bar: 'foo'}));

      beforeEach(() => {
        getDataStub.withArgs(news).returns(newsData);
        getDataStub.withArgs(relatedNews).returns(relatedNewsData);
      });

      it('sets related_news', () => {
        expect(getData.related_news).to.eql([relatedNewsData]);
      });
    });
  });
});

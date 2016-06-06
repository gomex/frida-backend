/*eslint no-undef: "off"*/

var publisherNews = require('../../../../lib/publisher/news');
var factory = require('../../../factories/news-attributes').news;
var metadataFactory = require('../../../factories/news-attributes').metadata;

describe('news', () => {
  describe('getData', () => {
    subj('getData', () => publisherNews.getData(news));

    given('metadata', () => metadataFactory.build());
    given('news', () => factory.build({published_at: new Date(), metadata: metadata}));

    given('expectedData', () => ({
      layout: news.metadata.layout,
      display_area: news.metadata.display_area,
      area: news.metadata.area,
      hat: news.metadata.hat,
      title: news.metadata.title,
      description: news.metadata.description,
      author: news.metadata.author,
      place: news.metadata.place,
      date: news.published_at,
      published_at: news.published_at,
      cover: {
        link: news.metadata.cover.link,
        thumbnail: news.metadata.cover.thumbnail,
        medium: news.metadata.cover.medium,
        small: news.metadata.cover.small,
        title: news.metadata.cover.title,
        credits: news.metadata.cover.credits,
        subtitle: news.metadata.cover.subtitle
      }
    }));

    it('exists', () => {
      expect(publisherNews.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    describe('when there is a cover', () => {
      beforeEach(() => {
        delete news.metadata.cover;
      });

      it('does not exist on data', () => {
        expect(getData.cover).to.not.exist;
      });
    });
  });
});

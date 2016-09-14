/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/post');
var factory = require('../../../../factories/post-attributes').post;
var metadataFactory = require('../../../../factories/post-attributes').metadata;

describe('lib/publisher/presenters/post.js', () => {
  given('metadata', () => metadataFactory.build({
    url: 'some_url'
  }));
  given('post', () => factory.build({
    metadata: metadata,
    url: 'some_url',
    published_at: new Date(),
    other_news: [],
    related_news: []
  }));

  describe('getData', () => {
    subj('getData', () => presenter.getData(post));

    given('expectedData', () => ({
      layout: post.metadata.layout,
      display_area: post.metadata.display_area,
      area: post.metadata.area,
      url: post.metadata.url,
      hat: post.metadata.hat,
      title: post.metadata.title,
      description: post.metadata.description,
      author: post.metadata.author,
      place: post.metadata.place,
      tags: post.tags,
      date: post.published_at,
      published_at: post.published_at,
      other_news: post.other_news,
      related_news: post.related_news,
      cover: {
        link: post.metadata.cover.link,
        thumbnail: post.metadata.cover.thumbnail,
        medium: post.metadata.cover.medium,
        small: post.metadata.cover.small,
        title: post.metadata.cover.title,
        credits: post.metadata.cover.credits,
        subtitle: post.metadata.cover.subtitle
      }
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    describe('when there is no cover', () => {
      beforeEach(() => {
        delete post.metadata.cover;
      });

      it('does not exist on data', () => {
        expect(getData.cover).to.not.exist;
      });
    });

    describe('when there is other_news', () => {
      given('post', () => factory.build({other_news: [otherNews]}));

      given('otherNews', () => factory.build());
      given('otherNewsData', () => ({bar: 'foo'}));

      beforeEach(() => {
        sandbox.stub(presenter, 'getListData').returns(otherNewsData);
      });

      it('calls getListData to items', () => {
        getData;
        expect(presenter.getListData).to.have.been.called;
      });

      it('returns other_news data', () => {
        expect(getData.other_news).to.eql([otherNewsData]);
      });
    });

    describe('when there is related_news', () => {
      given('post', () => factory.build({related_news: [relatedNews]}));

      given('relatedNews', () => factory.build());
      given('relatedNewsData', () => ({bar: 'foo'}));

      beforeEach(() => {
        sandbox.stub(presenter, 'getListData').returns(relatedNewsData);
      });

      it('calls getListData to items', () => {
        getData;
        expect(presenter.getListData).to.have.been.called;
      });

      it('returns related_news data', () => {
        expect(getData.related_news).to.eql([relatedNewsData]);
      });
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(post));

    given('expectedData', () => ({
      title: post.metadata.title,
      area: post.metadata.area,
      hat: post.metadata.hat,
      description: post.metadata.description,
      url: post.metadata.url,
      date: post.published_at,
      published_at: post.published_at,
      cover: {
        link: post.metadata.cover.link,
        thumbnail: post.metadata.cover.thumbnail,
        medium: post.metadata.cover.medium,
        small: post.metadata.cover.small,
        title: post.metadata.cover.title,
        credits: post.metadata.cover.credits,
        subtitle: post.metadata.cover.subtitle
      }
    }));

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });

    describe('when there is no cover', () => {
      beforeEach(() => {
        delete post.metadata.cover;
      });

      it('does not exist on data', () => {
        expect(getListData.cover).to.not.exist;
      });
    });
  });
});

/*eslint no-undef: "off"*/

var News = require('lib/models/news');
var presenter = require('lib/services/publisher/presenter/post');
var coverPresenter = require('lib/services/publisher/presenter/cover');
var optionsPresenter = require('lib/services/publisher/presenter/options');
var factory = require('test/factories/post-attributes').post;
var metadataFactory = require('test/factories/post-attributes').metadata;
var markdown = require('markdown').markdown;

describe('lib/services/publisher/presenter/post.js', () => {
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

  beforeEach(() => {
    sandbox.spy(coverPresenter, 'getData');
  });

  describe('getData', () => {
    subj('getData', () => presenter.getData(post));

    given('expectedData', () => ({
      layout: post.metadata.layout,
      area: post.metadata.area,
      url: post.metadata.url,
      path: post.metadata.url,
      hat: post.metadata.hat,
      title: post.metadata.title,
      description: post.metadata.description,
      author: post.metadata.author,
      editor: post.metadata.editor,
      place: markdown.toHTML(post.metadata.place),
      labels: post.tags,
      audio: post.audio,
      date: post.published_at,
      published_at: post.published_at,
      other_news: post.other_news,
      related_news: post.related_news,
      cover: post.metadata.cover
    }));

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getData;
      expect(coverPresenter.getData).to.have.been.calledWith(post);
    });

    describe('when there is other_news', () => {
      given('post', () => factory.build({other_news: [otherNews]}));

      given('otherNews', () => new News(factory.build()));
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

      describe('when has null vaule', () => {
        given('post', () => factory.build({other_news: [null, otherNews]}));

        it('removes null', () => {
          expect(getData.other_news).to.eql([otherNewsData]);
        });
      });
    });

    describe('when there is related_news', () => {
      given('post', () => factory.build({related_news: [relatedNews]}));

      given('relatedNews', () => new News(factory.build()));
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

      describe('when has null vaule', () => {
        given('post', () => factory.build({related_news: [null, relatedNews]}));

        it('removes null', () => {
          expect(getData.related_news).to.eql([relatedNewsData]);
        });
      });
    });

    describe('when there is no audio field', () => {
      beforeEach(() => {
        delete post.audio;
      });

      it('returns null', () => {
        expect(getData.audio).to.eql(null);
      });
    });
  });

  describe('getListData', () => {
    subj('getListData', () => presenter.getListData(post, options));

    given('expectedData', () => ({
      title: post.metadata.title,
      area: post.metadata.area,
      audio: post.audio,
      hat: post.metadata.hat,
      description: post.metadata.description,
      author: post.metadata.author,
      url: post.metadata.url,
      path: post.metadata.url,
      date: post.published_at,
      published_at: post.published_at,
      cover: post.metadata.cover
    }));

    given('options', () => ({ some: 'options' }));

    beforeEach(() => {
      sandbox.spy(optionsPresenter, 'getData');
    });

    it('exists', () => {
      expect(presenter.getListData).to.exist;
    });

    it('returns data', () => {
      expect(getListData).to.eql(expectedData);
    });

    it('calls cover presenter', () => {
      getListData;
      expect(coverPresenter.getData).to.have.been.calledWith(post);
    });

    it('calls options presenter', () => {
      getListData;
      expect(optionsPresenter.getData).to.have.been.calledWith(post, options);
    });
  });
});

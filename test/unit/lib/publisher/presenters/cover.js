/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/cover');
var factory = require('../../../../factories/post-attributes').post;
var metadataFactory = require('../../../../factories/post-attributes').metadata;

describe('lib/publisher/presenters/cover.js', () => {
  given('metadata', () => metadataFactory.build());
  given('post', () => factory.build({
    metadata: metadata
  }));

  describe('getData', () => {
    subj('getData', () => presenter.getData(post));

    given('expectedData', () => ({
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

    describe('when there is no link', () => {
      beforeEach(() => {
        delete post.metadata.cover.link;
      });

      it('does not exist on data', () => {
        expect(getData.cover).to.not.exist;
      });
    });
  });
});

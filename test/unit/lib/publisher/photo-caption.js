/*eslint no-undef: "off"*/

var publisherPhotoCaption = require('../../../../lib/publisher/photo-caption');
var publisherNews = require('../../../../lib/publisher/news');
var factory = require('../../../factories/photo-caption-attributes').photoCaption;

describe.skip('Photo Caption', () => {
  describe('getData', () => {
    subj('getData', () => publisherPhotoCaption.getData(photoCaption));

    given('photoCaption', () => factory.build());

    given('expectedData', () => ({
      layout: photoCaption.metadata.layout,
      title: photoCaption.metadata.title,
      date: photoCaption.published_at,
      cover: {
        link: photoCaption.metadata.cover.link,
        thumbnail: photoCaption.metadata.cover.thumbnail,
        medium: photoCaption.metadata.cover.medium,
        small: photoCaption.metadata.cover.small,
        title: photoCaption.metadata.cover.title,
        credits: photoCaption.metadata.cover.credits,
        subtitle: photoCaption.metadata.cover.subtitle
      }
    }));

    it('exists', () => {
      expect(publisherPhotoCaption.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData[0]).to.eql(expectedData);
    });

  });
});

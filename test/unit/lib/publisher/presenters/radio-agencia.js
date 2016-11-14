/*eslint no-undef: "off"*/

var Home = require('../../../../../lib/models/home');
var News = require('../../../../../lib/models/news');
var presenter = require('../../../../../lib/publisher/presenters/radio-agencia');
var postFactory = require('../../../../factories/post-attributes').post;

describe('lib/publisher/presenters/home.js', () => {
  describe('getData', () => {
    subj('getData', () => presenter.getData(home));

    given('featured_01', () => new News(postFactory.build()));
    given('home', () => new Home({
      name: 'radio_agencia',
      featured_01: featured_01
    }));

    it('sets layout', () => {
      expect(getData.layout).to.equal('radioagencia');
    });

    it('sets path', () => {
      expect(getData.path).to.equal('/radioagencia');
    });

    it('sets featured_01', () => {
      expect(getData.featured_01).to.exist;
    });
  });
});

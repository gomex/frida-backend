/*eslint no-undef: "off"*/

var presenter = require('../../../../../../lib/publisher/presenters/special/text');

describe('lib/publisher/presenters/special/text.js', () => {
  describe('getData', () => {
    subj('getData', () => presenter.getData(section));

    given('section', () => ({
      type: 'text',
      text: 'some *text*'
    }));

    it('succeeds', () => {
      getData;
    });

    it('has type', () => {
      expect(getData.type).to.equal('text');
    });

    it('translates text to markdown', () => {
      expect(getData.text).to.equal('<p>some <em>text</em></p>');
    });
  });
});

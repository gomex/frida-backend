/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/options');

describe('lib/publisher/presenters/options.js', () => {
  subj('getData', () => presenter.getData(post, options));

  given('post', () => ({
    body: 'some_text'
  }));

  given('options', () => ({
    content: true
  }));

  it('add content', () => {
    expect(getData.content).to.equal(post.body);
  });
});

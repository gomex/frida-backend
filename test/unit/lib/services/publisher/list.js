/*eslint no-undef: "off"*/

var publisher = require('../../../../../lib/services/publisher/list');

describe('lib/services/publisher/list', () => {
  describe('publishAll', () => {
    var subject = (callback) => publisher.publishAll(callback);

    it('succeeds', subject);
  });
});

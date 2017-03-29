var archives = require('lib/services/publisher/archives.js');

describe('Chronological file', () => {
  var subject = (callback) =>  archives.publish(callback);

  it('succeeds', (done) => {
    subject(done);
  });
});
/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/advertising');
var publisher = require('../../../../../lib/publisher/presenters/advertisings');
var factory = require('../../../../factories/advertising-attributes').advertising;
var metadataFactory = require('../../../../factories/advertising-attributes').metadata;

describe('lib/publisher/advertisings.js', () => {
  describe('.getData', () => {
    subj('getData', () => publisher.getData(advertisingList));

    given('advertising1', () => factory.build({
      metadata: metadataFactory.build({display_area: 'advertising_01'})
    }));
    given('advertising2', () => factory.build({
      metadata: metadataFactory.build({display_area: 'advertising_02'})
    }));

    given('advertisingData1', () => ({foo: 'bar'}));
    given('advertisingData2', () => ({bar: 'foo'}));

    given('advertisingList', () => ([
      advertising1,
      advertising2
    ]));

    given('expected', () => ({
      'advertising_01': advertisingData1,
      'advertising_02': advertisingData2
    }));

    beforeEach(() => {
      var stub = sandbox.stub(presenter, 'getData');
      stub.withArgs(advertising1).returns(advertisingData1);
      stub.withArgs(advertising2).returns(advertisingData2);
    });

    it('exists', () => {
      expect(publisher.getData).to.exist;
    });

    it('returns data', () => {
      expect(getData).to.eql(expected);
    });
  });
});

/*eslint no-undef: "off"*/

var presenter = require('../../../../../lib/publisher/presenters/list');
var presenters = require('../../../../../lib/publisher/presenter');
var postFactory = require('../../../../factories/post-attributes').post;

describe('publisher/presenters/list.js', () => {
  describe('getData', () => {
    subj('getData', () => presenter.getData(list));

    given('list', () => ({
      news: news,
      area: 'some_path',
      layout: 'some_layout'
    }));
    given('news', () => postFactory.buildList(50));
    given('newsData', () => ({foo: 'bar'}));

    beforeEach(() => {
      sandbox.stub(presenters, 'getListData').returns(newsData);
    });

    it('exists', () => {
      expect(presenter.getData).to.exist;
    });

    it('divides in pages', () => {
      expect(getData).to.have.lengthOf(3);
      expect(getData[0].list).to.have.lengthOf(20);
      expect(getData[1].list).to.have.lengthOf(20);
      expect(getData[2].list).to.have.lengthOf(10);
    });

    context('pages',  () => {
      it('sets layout', () => {
        expect(getData[0].layout).to.eql(list.layout);
      });

      it('sets area', () => {
        expect(getData[0].path).to.eql(list.path);
      });

      it('gets data of the list', () => {
        expect(getData[0].list[0]).to.eql(newsData);
      });

      context('pagination', () => {
        context('first page', () => {
          it('current', () => {
            expect(getData[0].current).to.eql(0);
          });

          it('total', () => {
            expect(getData[0].total).to.eql(3);
          });

          it('prev', () => {
            expect(getData[0].prev).to.eql(false);
          });

          it('next', () => {
            expect(getData[0].next).to.eql(true);
          });
        });

        context('mid page', () => {
          it('current', () => {
            expect(getData[1].current).to.eql(1);
          });

          it('total', () => {
            expect(getData[1].total).to.eql(3);
          });

          it('prev', () => {
            expect(getData[1].prev).to.eql(true);
          });

          it('next', () => {
            expect(getData[1].next).to.eql(true);
          });
        });

        context('last page', () => {
          it('current', () => {
            expect(getData[2].current).to.eql(2);
          });

          it('total', () => {
            expect(getData[2].total).to.eql(3);
          });

          it('prev', () => {
            expect(getData[2].prev).to.eql(true);
          });

          it('next', () => {
            expect(getData[2].next).to.eql(false);
          });
        });
      });
    });
  });
});

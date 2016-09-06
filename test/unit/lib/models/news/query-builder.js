/*eslint no-undef: "off"*/

var queryBuilder = require('../../../../../lib/models/news/query-builder');

describe('queryBuilder', () => {
  describe('.build', () => {
    subj('build', () => queryBuilder.build(params));

    given('params', () => ({}));

    it('exists', () => {
      expect(queryBuilder.build).to.exist;
    });

    it('returns empty filter', () => {
      expect(build).to.eql({});
    });

    describe('with query', () => {
      given('params', () => ({
        q: 'query'
      }));

      given('query', () => ({
        'metadata.title': new RegExp(params.q, 'i')
      }));

      it('returns', () => {
        expect(build).to.eql(query);
      });
    });

    describe('with status', () => {
      given('params', () => ({
        status: 'draft'
      }));

      given('query', () => ({
        status: 'draft'
      }));

      it('returns', () => {
        expect(build).to.eql(query);
      });

      describe('when has more status', () => {
        given('params', () => ({
          status: [
            'draft',
            'published'
          ]
        }));

        given('query', () => ({
          $or: [
            {'status': 'draft'},
            {'status': 'published'}
          ]
        }));

        it('returns', () => {
          expect(build).to.eql(query);
        });
      });
    });

    describe('with layout', () => {
      given('params', () => ({
        layouts: 'draft'
      }));

      given('query', () => ({
        'metadata.layout': 'draft'
      }));

      it('returns', () => {
        expect(build).to.eql(query);
      });

      describe('when has more layout', () => {
        given('params', () => ({
          layouts: [
            'post',
            'column'
          ]
        }));

        given('query', () => ({
          $or: [
            {'metadata.layout': 'post'},
            {'metadata.layout': 'column'}
          ]
        }));

        it('returns', () => {
          expect(build).to.eql(query);
        });
      });
    });
  });
});

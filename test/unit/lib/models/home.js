/*eslint no-undef: "off"*/

var Home = require('../../../../lib/models/home');

describe('unit/lib/models/home.js', () => {
  describe('findByName', () => {
    var subject = (callback) => Home.findByName(name, callback);

    given('name', () => 'some_name');

    given('criteria', () => ({
      name: name
    }));

    given('expected', () => ({
      foo: 'bar'
    }));

    beforeEach(() => {
      sandbox.stub(Home, 'findOne').yields(null, expected);
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('searches', (done) => {
      subject((err) => {
        expect(Home.findOne).to.have.been.calledWith(criteria);

        done(err);
      });
    });

    it('returns', (done) => {
      subject((err, national) => {
        expect(national).to.equal(expected);

        done(err);
      });
    });

    describe('when is not found', () => {
      beforeEach(() => {
        Home.findOne.restore();
        sandbox.stub(Home, 'findOne').yields(null, null);
      });

      it('has error', (done) => {
        subject((err) => {
          expect(err).to.exist;

          done();
        });
      });
    });
  });

  describe('init', () => {
    var subject = (callback) => Home.init(callback);

    given('bdf', () => ({
      name: 'bdf'
    }));

    beforeEach(() => {
      sandbox.spy(Home, 'create');
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('creates bdf', (done) => {
      subject((err) => {
        expect(Home.create).to.have.been.calledWith(bdf);
        done(err);
      });
    });

    describe('when already exists', () => {
      beforeEach((done) => {
        Home.create(bdf, done);
        Home.create.restore();
        sandbox.spy(Home, 'create');
      });

      it('creates bdf', (done) => {
        subject((err) => {
          expect(Home.create).to.not.have.been.called;
          done(err);
        });
      });
    });
  });
});

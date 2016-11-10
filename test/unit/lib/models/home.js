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
  });

  describe('.populateAllFields', () => {
    var subject = (callback) => home.populateAllFields(callback);

    given('home', () => new Home({
      featured_01: '53cb6b9b4f4ddef1ad47f943',
      featured_02: '53cb6b9b4f4ddef1ad47f943'
    }));

    beforeEach(() => {
      sandbox.spy(home, 'populate');
    });

    it('succeeds', (done) => {
      subject((err) => {
        done(err);
      });
    });

    it('calls populate', (done) => {
      subject((err) => {
        expect(home.populate).to.have.been.calledWith('featured_01 featured_02');

        done(err);
      });
    });
  });

  describe('init', () => {
    var subject = (callback) => Home.init(callback);

    given('bdf', () => ({
      name: 'bdf',
      layout: 'national',
      path: '/'
    }));

    given('radioAgencia', () => ({
      name: 'radio_agencia',
      layout: 'radioagencia',
      path: '/radioagencia'
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

    it('creates radio_agencia', (done) => {
      subject((err) => {
        expect(Home.create).to.have.been.calledWith(radioAgencia);
        done(err);
      });
    });

    describe('when bdf already exists', () => {
      beforeEach((done) => {
        Home.create(bdf, done);
        Home.create.restore();
        sandbox.spy(Home, 'create');
      });

      it('creates bdf', (done) => {
        subject((err) => {
          expect(Home.create).to.not.have.been.calledWith(bdf);
          done(err);
        });
      });
    });

    describe('when radio_agencia already exists', () => {
      beforeEach((done) => {
        Home.create(radioAgencia, done);
        Home.create.restore();
        sandbox.spy(Home, 'create');
      });

      it('creates bdf', (done) => {
        subject((err) => {
          expect(Home.create).to.not.have.been.calledWith(radioAgencia);
          done(err);
        });
      });
    });
  });
});

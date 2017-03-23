/*eslint no-undef: "off"*/

var Home = require('lib/models/home');
var bdf = require('lib/models/home/bdf');
var radioAgencia = require('lib/models/home/radio-agencia');
var publisher = require('lib/services/publisher/home');
var hexo = require('lib/services/hexo');
var postFactory = require('test/factories/post-attributes').post;

describe('lib/services/publisher/home', () => {
  describe('publish', () => {
    var subject = (callback) => publisher.publish(home, callback);

    given('home', () => new Home({ name: 'some_name' }));

    beforeEach(() => {
      sandbox.spy(home, 'populateAllFields');
      sandbox.stub(hexo, 'publishHome').yields();
    });

    it('succeeds', (done) => {
      subject(done);
    });

    it('populates news', (done) => {
      subject((err) => {
        expect(home.populateAllFields).to.have.been.called;
        done(err);
      });
    });

    it('delegates to hexo', (done) => {
      subject((err) => {
        expect(hexo.publishHome).to.have.been.calledWith(home);
        done(err);
      });
    });

    context('when is bdf', () => {
      given('home', () => new Home({ name: 'bdf' }));

      given('lastNews', () => postFactory.buildList(2));
      given('mostRead', () => postFactory.buildList(2));

      beforeEach(() => {
        sandbox.stub(bdf, 'getLastNews').yields(null, lastNews);
        sandbox.stub(bdf, 'getMostRead').yields(null, mostRead);
      });

      it('enriches with latest news', (done) => {
        subject((err) => {
          expect(home.last_news).to.equal(lastNews);
          done(err);
        });
      });

      it('enriches with most read', (done) => {
        subject((err) => {
          expect(home.most_read).to.equal(mostRead);
          done(err);
        });
      });
    });

    describe('when is radioagencia', () => {
      given('home', () => new Home({
        name: 'radio_agencia'
      }));
      given('latestNews', () => postFactory.buildList(2));

      beforeEach(() => {
        sandbox.stub(radioAgencia, 'getRadioNewsList').yields(null, latestNews);
      });

      it('enriches home with latest radioagencia news', (done) => {
        subject((err) => {
          expect(home.latest_news).to.equal(latestNews);
          done(err);
        });
      });
    });
  });
});

/*eslint no-undef: "off"*/

var Home = require('lib/models/home');
var News = require('lib/models/news');
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
        sandbox.stub(hexo, 'publishAdvertisingData').yields();
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

      it('publishes advertising data', (done) => {
        subject((err) => {
          expect(hexo.publishAdvertisingData).to.have.been.calledWith(home);
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

      var behavesAsService = (section, name) => {
        describe(`with service ${name}`, () => {
          given('post', () => new News(postFactory.build({
            status: 'published', tags: [name]
          })));

          beforeEach((done) => { post.save(done); });

          beforeEach(() => {
            process.env.TOGGLE_6kDAA5TZ_AUTOMATIC_SERVICES = 'enabled';
          });

          it('enriches home', (done) => {
            subject((err) => {
              expect(home[section].metadata.title).to.equal(post.metadata.title);
              done(err);
            });
          });
        });
      };

      behavesAsService('service_01', 'hojenahistoria');
      behavesAsService('service_02', 'alimentoesaude');
      behavesAsService('service_03', 'nossosdireitos');
      behavesAsService('service_04', 'fatoscuriosos');
      behavesAsService('service_05', 'mosaicocultural');
      behavesAsService('service_06', 'conectados');
      behavesAsService('service_07', 'momentoagroecologico');
      behavesAsService('service_08', 'falaai');
      behavesAsService('radio_01', 'programasp');
      behavesAsService('radio_02', 'programape');
    });
  });
});

/*eslint no-undef: "off"*/

var publisher = require('lib/services/publisher/list');
var hexo = require('lib/services/hexo');
var photoCaptions = require('lib/models/news/photo-captions');
var photoCaptionFactory = require('test/factories/photo-caption-attributes').photoCaption;

describe('lib/services/publisher/list', () => {
  describe('publishAll', () => {
    var subject = (callback) => publisher.publishAll(callback);

    beforeEach(() => {
      sandbox.stub(hexo, 'publishList').yields();
    });

    it('succeeds', subject);

    it('updates last news data file', function(done){
      subject((err) => {
        expect(hexo.publishList).to.have.been.calledWith({
          layout: 'news_list',
          area: 'ultimas_noticias',
          path: 'ultimas_noticias',
          news: []
        });

        done(err);
      });
    });

    describe('and it is a service', function() {
      var behaveAsService = function(tag, path) {
        it('updates area', function(done){
          subject(function(err) {
            expect(hexo.publishList).to.have.been.calledWith({
              layout: 'news_list',
              area: tag,
              path: `radioagencia/${path}`,
              news: []
            });

            done(err);
          });
        });
      };

      describe('hoje na historia', () => {
        behaveAsService('hojenahistoria', 'hoje-na-historia');
      });

      describe('alimento e saude', () => {
        behaveAsService('alimentoesaude', 'alimento-e-saude');
      });

      describe('nossos direitos', () => {
        behaveAsService('nossosdireitos', 'nossos-direitos');
      });

      describe('fatos curiosos', () => {
        behaveAsService('fatoscuriosos', 'fatos-curiosos');
      });

      describe('mosaico cultural', () => {
        behaveAsService('mosaicocultural', 'mosaico-cultural');
      });
    });

    it('updates regional list', function(done){
      subject(function(err) {
        expect(hexo.publishList).to.have.been.calledWithMatch({
          layout: 'news_list',
          area: 'tabloid_mg'
        });

        done(err);
      });
    });

    describe('republishes photo-caption list', () => {
      given('list', () => ([photoCaptionFactory.build()]));

      beforeEach(() => {
        sandbox.stub(photoCaptions, 'getList').yields(null, list);
      });

      it('searches list', (done) => {
        subject((err) => {
          expect(photoCaptions.getList).to.have.been.called;

          done(err);
        });
      });

      it('publishes list', (done) => {
        subject((err) => {
          expect(hexo.publishList).to.have.been.calledWith({
            layout: 'photo_caption_list',
            path: 'charges',
            news: list
          });

          done(err);
        });
      });
    });
  });
});

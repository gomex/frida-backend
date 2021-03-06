var fs = require('fs');
var supertest = require('supertest');

var News = require('lib/models/news');
var Home = require('lib/models/home');
var publisher = require('lib/services/publisher');
var republisher = require('lib/services/publisher/republisher');
var worker = require('lib/services/publisher/worker');
var server = require('lib/http/server');
var shared = require('test/integration/shared');
var metadataFactory = require('test/factories/news-attributes').metadata;
var newsFactory = require('test/factories/news-attributes').news;
var columnFactory = require('test/factories/column-attributes').column;
var photoCaptionFactory = require('test/factories/photo-caption-attributes').photoCaption;
var tabloidFactory = require('test/factories/tabloid-attributes').tabloid;

var api = supertest('https://localhost:5000');

describe('REST API:', () => {
  beforeEach(Home.init);

  var NEWS_RESOURCE = '/news';

  var hexoPaths = {
    sourcePath: process.env.HEXO_SOURCE_PATH + '/',
    postsPath: [process.env.HEXO_SOURCE_PATH, '_posts'].join('/')
  };

  // helper functions
  var deleteDirSync = function(path) {
    if(fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, _index) {
        var curPath = path + '/' + file;
        if(fs.lstatSync(curPath).isDirectory()) {
          deleteDirSync(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });

      fs.rmdirSync(path);
    }
  };

  var verifyColumnNewsCommonAttributes = function (actual, expected) {
    assert.equal(typeof actual._id !== 'undefined', true);
    assert.equal(actual.body, expected.body);
    assert.equal(actual.created_at.getTime(), newsCreatedAt);
    assert.equal(actual.metadata.description, expected.metadata.description);
    assert.equal(actual.metadata.hat, expected.metadata.hat);
    assert.equal(actual.metadata.layout, expected.metadata.layout);
    assert.equal(actual.metadata.title, expected.metadata.title);
  };

  var verifyNewsAttributes = function(actualNews, expectedNews){
    verifyColumnNewsCommonAttributes(actualNews, expectedNews);
    assert.equal(actualNews.metadata.area, expectedNews.metadata.area);
    assert.equal(actualNews.metadata.author, expectedNews.metadata.author);
    assert.equal(actualNews.metadata.place, expectedNews.metadata.place);
  };

  var verifyColumnAttributes = function(actualColumn, expectedColumn) {
    verifyColumnNewsCommonAttributes(actualColumn, expectedColumn);
    assert.equal(actualColumn.metadata.columnist, expectedColumn.metadata.columnist);
  };

  var newsCreatedAt;

  before(() => {
    server.start();
  });

  beforeEach((done) => {
    var testDate = new Date('Feb 14, 2016 01:15:00');

    sandbox.useFakeTimers(testDate.getTime(), 'Date');
    newsCreatedAt = Date.now();

    deleteDirSync(hexoPaths.sourcePath);
    done();
  });

  beforeEach((done) => {
    shared.createUser(done);
  });

  after((done) => {
    deleteDirSync(hexoPaths.sourcePath);
    done();
  });

  describe('POST /news', () => {
    var subject = (news) => {
      return api.post(NEWS_RESOURCE).send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    shared.behavesAsAuthenticated(() =>
      api.post(NEWS_RESOURCE)
    );

    it('persists news', (done) => {
      var news = newsFactory.build();

      subject(news)
        .expect(201)
        .end((err, res) => {
          if(err){ done(err); }

          var newsId = res.body.id;
          assert(typeof newsId !== 'undefined');
          News.findById(newsId, (err, result) => {
            verifyNewsAttributes(result, news);
            assert.equal(result.status, 'draft');
            assert.ok(result.created_at);
            done();
          });
        });
    });

    it('persists columns', (done) => {
      var column = columnFactory.build();

      subject(column)
        .expect(201)
        .end((err, res) => {
          if(err){ done(err); }

          var columnId = res.body.id;
          assert(typeof columnId !== 'undefined');

          News.findById(columnId, (err, result) => {
            verifyColumnAttributes(result, column);
            assert.equal(result.status, 'draft');
            done();
          });
        });
    });
  });

  describe('GET /news/<id>', () => {

    var news;
    var newsId;

    beforeEach((done) => {
      news = newsFactory.build();
      api.post(NEWS_RESOURCE)
        .send(news)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end((err, res) => {
          if(err){
            done(err);
          } else {
            newsId = res.body.id;
            done();
          }
        });
    });

    var subject = () => {
      return api.get(NEWS_RESOURCE + '/' + newsId).send().auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    shared.behavesAsAuthenticated(() =>
      api.get(NEWS_RESOURCE + '/' + newsId)
    );

    it('retrieves previously saved news or column', (done) => {
      subject()
        .expect(200)
        .end((err, res) => {
          if(err){
            done(err);
          } else {
            var newsReturnedFromGet = res.body;
            assert.equal(newsReturnedFromGet._id, newsId);
            assert.equal(newsReturnedFromGet.metadata.area, news.metadata.area);
            assert.equal(newsReturnedFromGet.metadata.author, news.metadata.author);
            assert.equal(newsReturnedFromGet.metadata.description, news.metadata.description);
            assert.equal(newsReturnedFromGet.metadata.hat, news.metadata.hat);
            assert.equal(newsReturnedFromGet.metadata.layout, news.metadata.layout);
            assert.equal(newsReturnedFromGet.metadata.place, news.metadata.place);
            assert.equal(newsReturnedFromGet.metadata.title, news.metadata.title);
            done();
          }
        });
    });
  });

  describe('PUT /news/<id>', () => {

    var news;
    var newsId;

    var subject = () => {
      return api.put(NEWS_RESOURCE + '/' + newsId).send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    beforeEach((done) => {
      news = newsFactory.build();
      api.post(NEWS_RESOURCE)
        .send(news)
        .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
        .expect(201)
        .end((err, res) => {
          if(err){
            done(err);
          } else {
            newsId = res.body.id;
            done();
          }
        });
    });

    shared.behavesAsAuthenticated(() =>
      api.put(NEWS_RESOURCE + '/' + newsId)
    );

    it('updates previously saved news', (done) => {
      news.metadata.title = 'Outro Título';
      news.metadata.area = 'direitos_humanos';
      news.metadata.hat = 'Outro Chapéu';
      news.metadata.description = 'Outra Descrição';

      subject()
        .expect(200)
        .end((err, res) => {
          if(err) return done(err);

          var id = res.body._id;
          assert(typeof id !== 'undefined');
          assert.equal(id, newsId);

          News.findById(newsId, (err, result) => {
            verifyNewsAttributes(result, news);
            done();
          });
        });
    });

    it('updates updated_at date', (done) => {
      subject()
        .expect(200)
        .end((err, _res) => {
          if(err){ done(err); }

          News.findById(newsId, (err, result) => {
            assert.equal(result.updated_at.getTime(), Date.now());
            done();
          });
        });
    });

    it('does not set news path', (done) => {
      news.metadata.url = '/bad-bad-path';

      subject()
        .expect(200)
        .end((err, res) => {
          if(err){ done(err); }

          var id = res.body._id;
          assert(typeof id !== 'undefined');
          assert.equal(id, newsId);

          News.findById(newsId, (err, result) => {
            assert.equal(result.metadata.url, undefined);
            done();
          });
        });
    });

    it('increments version', (done) => {
      subject()
        .expect(200)
        .end((err, res) => {
          expect(res.body.__v).to.equal(1);

          done(err);
        });
    });

    it('does not reset news path for published news', (done) => {
      var now = new Date();
      var past = new Date(1000);

      var metadata = metadataFactory.build({ url: '/this-path-should-not-disappear' });
      var news = newsFactory.build({ status: 'published', published_at: now, created_at: past, metadata: metadata});

      news = new News(news);
      news.save((err, newsIdent) => {
        if(err) throw err;

        news.metadata.url = '';

        subject()
        .expect(200)
        .end((err, _result) => {
          if (err) return done(err);

          News.findById(newsIdent, (err, result) => {
            assert.equal(result.metadata.url, '/this-path-should-not-disappear');
            done(err);
          });
        });
      });
    });

  });

  describe('POST /news/<id>/unpublish', () => {
    var news;
    var newsId;

    var subject = () => {
      return api.post(NEWS_RESOURCE + '/' + newsId + '/unpublish').send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    beforeEach((done) => {
      news = new News(newsFactory.build({status: 'draft'}));
      news.save((err) => {
        if (err) {
          done(err);
          return;
        }

        newsId = news._id.valueOf();
        publisher.publish(news, done);
      });
    });

    shared.behavesAsAuthenticated(() =>
      api.post(NEWS_RESOURCE + '/' + newsId + '/unpublish')
    );

    it('succeeds', (done) => {
      subject().expect(202).end(done);
    });

    it('has content type json', (done) => {
      subject().expect('Content-Type', /json/).end(done);
    });
  });

  describe('POST /news/republish', () => {
    var subject = () => {
      return api.post(NEWS_RESOURCE + '/republish').send().auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
    };

    beforeEach(() => {
      sandbox.stub(republisher, 'publish').yields();
    });

    it('succeeds', (done) => {
      subject()
        .expect(202)
        .end(done);
    });

    it('succeeds', (done) => {
      subject()
        .end(() => {
          expect(republisher.publish).to.have.been.called;
          done();
        });
    });
  });

  describe('POST /news/<id>/publish', () => {
    describe('when entity is of type news', () => {
      var news;
      var newsId;

      beforeEach((done) => {
        sandbox.stub(worker, 'publishLater').yields(null, news);

        news = newsFactory.build();
        api.post(NEWS_RESOURCE)
          .send(news)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(201)
          .end((err, res) => {
            if(err){
              done(err);
            } else {
              newsId = res.body.id;
              done();
            }
          });
      });

      var subject = () => {
        return api.post(NEWS_RESOURCE + '/' + newsId + '/publish').send(news).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
      };

      shared.behavesAsAuthenticated(() =>
        api.put(NEWS_RESOURCE + '/' + newsId + '/publish')
      );

      it('succeeds', (done) => {
        subject()
          .expect(202)
          .end(done);
      });

      it('returns json', (done) => {
        subject()
          .expect('Content-Type', /json/)
          .end(done);
      });
    });

    describe('when entity is of type photo caption', () => {
      var photoCaption;
      var photoCaptionId;
      beforeEach((done) => {
        photoCaption = photoCaptionFactory.build();
        api.post(NEWS_RESOURCE)
          .send(photoCaption)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(201)
          .end((err, res) => {
            if(err) throw err;

            photoCaptionId = res.body.id;
            done();
          });
      });

      var subject = () => {
        return api.post(NEWS_RESOURCE + '/' + photoCaptionId + '/publish').send(photoCaption).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
      };

      it('succeeds', (done) => {
        subject()
          .expect(202)
          .end(done);
      });
    });

    describe('when entity is of type tabloid', () => {
      var tabloid;
      var tabloidId;
      beforeEach((done) => {
        tabloid = tabloidFactory.build();
        api.post(NEWS_RESOURCE)
          .send(tabloid)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .expect(201)
          .end((err, res) => {
            if(err) throw err;

            tabloidId = res.body.id;
            done();
          });
      });

      var subject = () => {
        return api.post(NEWS_RESOURCE + '/' + tabloidId + '/publish').send(tabloid).auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD);
      };

      it('succeeds', (done) => {
        subject()
          .expect(202)
          .end(done);
      });
    });
  });
});

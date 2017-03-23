/*eslint no-undef: "off"*/

var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');

var site = require('lib/services/site');

describe('lib/services/site.js', () => {
  describe('remove', () => {
    var subject = (urlPath, callback) => site.remove(urlPath, callback);

    given('urlPath', () => '/2017/03/03/audiencia-propoe-fim-do-conflito-entre-mst-e-araupel-no-parana/');
    given('newsFileSystemPath', () => path.join(process.env.HEXO_SITE_DEST, urlPath));

    describe('when news exists', () => {
      beforeEach((done) => {
        mkdirp(newsFileSystemPath, (err) => {
          if(err) return callback(err);

          fs.writeFile(path.join(newsFileSystemPath, 'index.html'), 'news content', done);
        });
      });

      it('removes news directory along with index file', (done) => {
        subject(urlPath, (err) => {
          expect(() => fs.statSync(newsFileSystemPath)).to.throw();

          done(err);
        });
      });
    });

    describe('when news does not exist', () => {
      it('succeeds', (done) => {
        subject('/non/existent/news/path/index.html', done);
      });
    });
  });
});

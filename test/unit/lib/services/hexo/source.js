/*eslint no-undef: "off"*/

var path = require('path');
var fs = require('fs');
var rmdir = require('rmdir');

var hexoSource = require('lib/services/hexo/source');

describe('lib/services/hexo/source.js', () => {
  describe('.write', () => {
    var subject = (callback) => hexoSource.write(filepath, content, callback);

    given('sourcePath', () => process.env.HEXO_SOURCE_PATH);
    given('dir', () => 'some_dir');
    given('name', () => 'some_file1.txt');
    given('content', () => 'some content');
    given('filepath',  () => path.join(dir, name));
    given('absoluteDirPath',  () => path.join(sourcePath, dir));
    given('absoluteFilePath',  () => path.join(absoluteDirPath, name));

    beforeEach((done) => rmdir(absoluteDirPath, () => { done(); }));

    it('creates directory', (done) => {
      subject((err) => {
        expect(fs.statSync(absoluteDirPath).isDirectory()).to.be.true;

        done(err);
      });
    });

    it('creates file', (done) => {
      subject((err) => {
        expect(fs.statSync(absoluteFilePath).isFile()).to.be.true;

        done(err);
      });
    });

    it('writes', (done) => {
      subject((err) => {
        expect(fs.readFileSync(absoluteFilePath, 'utf8')).to.eql(content);

        done(err);
      });
    });
  });

  describe('remove', () => {
    var subject = (callback) => hexoSource.remove(filepath, callback);

    given('filepath', () => 'some_file2.txt');
    given('absoluteFilepath', () => path.join(process.env.HEXO_SOURCE_PATH, filepath));

    beforeEach(() => {
      fs.writeFileSync(absoluteFilepath, '');
    });

    it('removes file', (done) => {
      subject((err) => {
        expect(() => fs.statSync(absoluteFilepath)).to.throw();

        done(err);
      });
    });

    describe('when the file does not exists', () => {
      beforeEach(() => {
        fs.unlink(absoluteFilepath, () => {});
      });

      it('succeeds', (done) => {
        subject((err) => {
          done(err);
        });
      });
    });
  });
});

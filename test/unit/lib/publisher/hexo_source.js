/*eslint no-undef: "off"*/

var path = require('path');
var fs = require('fs');

var hexoSource = require('../../../../lib/publisher/hexo_source');

describe('lib/publisher/hexo_source.js', () => {
  describe('.write', () => {
    var subject = (callback) => hexoSource.write(filepath, content, callback);

    given('sourcePath', () => process.env.HEXO_SOURCE_PATH);
    given('dir', () => 'some_dir');
    given('name', () => 'some_file1.txt');
    given('content', () => 'some content');
    given('filepath',  () => path.join(dir, name));
    given('absoluteDirPath',  () => path.join(sourcePath, dir));
    given('absoluteFilePath',  () => path.join(absoluteDirPath, name));

    beforeEach(() => {
      fs.unlink(absoluteFilePath, () => {});
      fs.rmdir(absoluteDirPath, () => {});
    });

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

  describe('removeAll', () => {
    var subject = () => hexoSource.removeAll();

    it('keeps hexo source folder', (done) => {
      var hexoSourcePath = '/tmp/removeAll-' + Math.round(Math.random() * 100000);
      process.env.HEXO_SOURCE_PATH = hexoSourcePath;
      fs.mkdirSync(hexoSourcePath);

      subject();
      expect(fs.readdirSync(process.env.HEXO_SOURCE_PATH)).to.be.empty;
      done();
    });

    it('removes one file from hexo source folder', (done) => {
      var hexoSourcePath = '/tmp/removeAll-' + Math.round(Math.random() * 100000);
      process.env.HEXO_SOURCE_PATH = hexoSourcePath;
      fs.mkdirSync(hexoSourcePath);
      fs.closeSync(fs.openSync(hexoSourcePath + '/a_file', 'w'));

      subject();
      expect(fs.readdirSync(process.env.HEXO_SOURCE_PATH)).to.be.empty;
      done();
    });

    it('removes multiple files from hexo source folder', (done) => {
      var hexoSourcePath = '/tmp/removeAll-' + Math.round(Math.random() * 100000);
      process.env.HEXO_SOURCE_PATH = hexoSourcePath;
      fs.mkdirSync(hexoSourcePath);
      fs.closeSync(fs.openSync(hexoSourcePath + '/one_file', 'w'));
      fs.closeSync(fs.openSync(hexoSourcePath + '/two_file', 'w'));

      subject();
      expect(fs.readdirSync(process.env.HEXO_SOURCE_PATH)).to.be.empty;
      done();
    });

    it('removes empty folders from hexo source folder', (done) => {
      var hexoSourcePath = '/tmp/removeAll-' + Math.round(Math.random() * 100000);
      process.env.HEXO_SOURCE_PATH = hexoSourcePath;
      fs.mkdirSync(hexoSourcePath);
      fs.mkdirSync(hexoSourcePath + '/empty');

      subject();
      expect(fs.readdirSync(process.env.HEXO_SOURCE_PATH)).to.be.empty;
      done();
    });

    it('removes folders with files from hexo source folder', (done) => {
      var hexoSourcePath = '/tmp/removeAll-' + Math.round(Math.random() * 100000);
      process.env.HEXO_SOURCE_PATH = hexoSourcePath;
      fs.mkdirSync(hexoSourcePath);
      fs.mkdirSync(hexoSourcePath + '/with_files');
      fs.closeSync(fs.openSync(hexoSourcePath + '/with_files/file', 'w'));

      subject();
      expect(fs.readdirSync(process.env.HEXO_SOURCE_PATH)).to.be.empty;
      done();
    });
  });
});

/*eslint no-undef: "off"*/

var fs = require('fs');
var grayMatter = require('gray-matter');
var staticFiles = require('../../../../lib/publisher/static-files');

describe('lib/publisher/static_files.js', () => {
  describe('.generate', () => {
    var subject = (callback) => staticFiles.generate(name, layout, callback);

    given('name', () => 'any_name');
    given('layout', () => 'any_layout');
    given('expectedPath', () => process.env.HEXO_SOURCE_PATH + `/${name}/index.md`);
    given('expectedData', () => grayMatter.stringify('', {layout: layout}));

    beforeEach((done) => {
      fs.unlink(expectedPath, () => done());
    });

    it('exists', () => {
      expect(staticFiles.generate).to.exist;
    });

    it('creates file', (done) => {
      subject((err) => {
        expect(fs.statSync(expectedPath).isFile()).to.be.true;

        done(err);
      });
    });

    it('writes layout', (done) => {
      subject((err) => {
        expect(fs.readFileSync(expectedPath, 'utf8')).to.eql(expectedData);

        done(err);
      });
    });
  });
});


var columnists = require('../../../lib/columnists');
var fs = require('fs');
var assert = require('assert');


describe('Columnists:', function() {

  var data = [
    {
      "email": "a@a.a",
      "name": "Alfonso",
    },
    {
      "email": "b@b.b",
      "name": "Baleia",
    }
  ];

  describe('columnists data',function(){
    it('should toDATA data to right format', function(done) {
      var result = columnists.read(data);
      var expect = {
        "a@a.a": {
           "name": "Alfonso"
        },
        "b@b.b": {
           "name": "Baleia"
        }
      };

      assert.deepEqual(expect, result);
      done();
    });

    it('should ', function(done) {
      var expect = "a@a.a:\n  name: Alfonso\nb@b.b:\n  name: Baleia\n";

      columnists.write(undefined, data, function(err){
        assert.equal(err, 'Need a path to save data files');

        done();
      });
    });

    it('should save a file on a specify path', function(done) {
      var expect = "a@a.a:\n  name: Alfonso\nb@b.b:\n  name: Baleia\n";

      columnists.write('/tmp', data, function(err){
        var data = fs.readFileSync('/tmp/columnists.yml','utf8');
        assert.equal(expect, data);

        done();
      });
    });

  });
});

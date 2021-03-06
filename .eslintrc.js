module.exports = {
    "env": {
        "node": true,
        "jasmine": true,
        "mocha": true,
        "es6": true,
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            2,
            2
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "quotes": [
            2,
            "single"
        ],
        "semi": [
            2,
            "always"
        ],
        "no-unused-vars": [
          2,
          {
            "args": "after-used",
            "argsIgnorePattern": "^_"
          }
        ],
        "no-console": 0
    },
  "globals": {
    "mongoose": true,
    "sinon": true,
    "assert": true,
    "sandbox": true
  }
};

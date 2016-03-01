module.exports = {
    "env": {
        "node": true,
        "jasmine": true,
        "mocha": true
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
        "no-console": 0
    },
  "globals": {
    "mongoose": true
  }
};

module.exports = {
  "development": {
    "NODE_ENV": "development",
    "NODE_DEBUG": false,
    "DEBUG": false
  },
  "development_debug": {
    "NODE_ENV": "development",
    "NODE_DEBUG": true,
    "DEBUG": "*"
  },
  "test": {
    "NODE_ENV": "development",
    "NODE_DEBUG": false,
    "DEBUG": false
  },
  "production": {
    "NODE_ENV": "production",
    "NODE_DEBUG": false,
    "DEBUG": false
  },
  "webpack_dev": {
    "NODE_ENV": "development",
    "NODE_DEBUG": false,
    "WEBPACK_ENV": "development"
  },
  "webpack_prod": {
    "NODE_ENV": "production",
    "NODE_DEBUG": false,
    "WEBPACK_ENV": "production"
  }
};

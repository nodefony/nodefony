const path = require('path');
const devConfigPath = path.resolve(__dirname, "config", "webpack.dev.js");
const prodConfigPath = path.resolve(__dirname, "config", "webpack.prod.js");

switch (process.env.WEBPACK_ENV) {
case 'prod':
case 'production':
  module.exports = require(prodConfigPath)({
    env: 'production'
  });
  break;
case 'dev':
case 'development':
  module.exports = require(devConfigPath)({
    env: 'development'
  });
  break;
default:
  module.exports = require(prodConfigPath)({
    env: 'development'
  });
}
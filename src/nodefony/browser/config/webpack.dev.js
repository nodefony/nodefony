const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

module.exports = function () {

  return [merge(commonConfig({
    env: ENV
  }), {
    mode: 'development',
    output: {
      filename: 'nodefony.js',
    },
    module: {
      rules: []
    }
  })];
};

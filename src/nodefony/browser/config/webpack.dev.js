const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

module.exports = function () {

  return [webpackMerge(commonConfig({
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
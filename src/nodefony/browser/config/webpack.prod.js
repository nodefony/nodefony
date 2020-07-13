const ENV = process.env.ENV = process.env.NODE_ENV = 'production';
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function () {

  return [merge(commonConfig({
    env: ENV
  }), {
    mode: 'production',
    output: {
      filename: 'nodefony.min.js',
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            warnings: true,
            compress: true
          },
          extractComments: true,
          cache: true,
          parallel: true
        })
      ]
    },
    module: {
      rules: []
    }
  })];
};

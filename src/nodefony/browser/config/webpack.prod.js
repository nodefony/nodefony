const ENV = process.env.ENV = process.env.NODE_ENV = 'production';
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function () {

  return [webpackMerge(commonConfig({
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
      rules: [{
        // BABEL TRANSCODE
        test: new RegExp("\.es6$|\.js$"),
        exclude: new RegExp("node_modules"),
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }]
      }]
    }
  })];
};
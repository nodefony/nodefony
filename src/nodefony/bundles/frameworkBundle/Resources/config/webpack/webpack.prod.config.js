/*
 * WEBPACK PROD CONFIGURATION
 */
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: "production",
  plugins: [
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        warnings: true,
        compress: true
      },
      parallel: true
    })
  ]
};